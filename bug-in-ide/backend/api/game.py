from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.game import (
    ScanBugRequest, ScanBugResponse, UpdateStatsRequest, 
    PlayerStats, LeaderboardEntry, PortalResponse, CodeSnippetResponse, CodeSnippet,
    StartGameRequest, StartGameResponse, CompilerScanResponse
)
from services.game_state import game_state
from services.exit_portals import get_random_exit_portal
import json
import random
import os
import asyncio
import threading
import time
from typing import List

router = APIRouter()

# Background task to move compiler scan
def compiler_scan_loop():
    """Background loop to automatically move the compiler scan"""
    while True:
        if game_state.compiler_scan_active:
            game_state.update_compiler_scan()
        time.sleep(0.5)  # Check every 0.5 seconds

# Start the background task
scan_thread = threading.Thread(target=compiler_scan_loop, daemon=True)
scan_thread.start()

@router.get("/test")
def test_endpoint():
    """Test endpoint to verify API is working"""
    return {"message": "Game API is working!", "endpoints": [
        "POST /api/start-game",
        "POST /api/start-simple-game", 
        "GET /api/compiler-scan-status",
        "POST /api/scan-bug-position",
        "GET /api/exit-portal"
    ]}

@router.post("/start-game", response_model=StartGameResponse)
def start_game(request: StartGameRequest):
    """Start a new game with compiler scan"""
    try:
        # Get a random code snippet
        with open(os.path.join("static", "snippets.json"), "r") as f:
            snippets = json.load(f)
        
        snippet = random.choice(snippets)
        code_snippet_response = CodeSnippetResponse(
            lines=snippet["lines"],
            language=snippet["language"],
            filename=snippet["filename"],
            total_lines=len(snippet["lines"])
        )
        
        # Start the game
        game_id = game_state.start_new_game(
            player_name=request.player_name,
            code_snippet=snippet,
            difficulty=request.difficulty
        )
        
        return StartGameResponse(
            success=True,
            game_id=game_id,
            message=f"Game started for {request.player_name}!",
            code_snippet=code_snippet_response,
            compiler_scan_position=game_state.compiler_scan_position,
            scan_speed=game_state.scan_speed
        )
        
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Code snippets file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting game: {str(e)}")

@router.get("/init-game")
def init_game():
    """Initialize a basic game - GET endpoint for easy testing"""
    try:
        # Simple game initialization
        game_state.reset_game()
        
        # Set a test bug position
        game_state.set_bug_position(5, 10)  # Closer bug for faster testing
        
        # Start compiler scan with faster speed for testing
        game_state.compiler_scan_active = True
        game_state.compiler_scan_position = {"line": 1, "column": 1}
        game_state.scan_speed = 0.5  # Move every 0.5 seconds for visible movement
        game_state.max_columns_per_line = 20  # Shorter lines for faster testing
        game_state.total_lines = 10  # Limited lines for testing
        game_state.last_scan_time = time.time()
        
        return {
            "success": True,
            "message": "Game initialized! Compiler scan will move every 0.5 seconds.",
            "bug_position": game_state.get_bug_position(),
            "compiler_scan_position": game_state.compiler_scan_position,
            "scan_speed": game_state.scan_speed,
            "instructions": "Watch the scan position change in /api/compiler-scan-status or use POST /api/scan-bug-position to search"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/start-simple-game")
def start_simple_game():
    """Simple game start endpoint for testing"""
    try:
        # Get a random code snippet  
        with open(os.path.join("static", "snippets.json"), "r") as f:
            snippets = json.load(f)
        
        snippet = random.choice(snippets)
        
        # Start the game with default player
        game_id = game_state.start_new_game(
            player_name="Player1",
            code_snippet=snippet,
            difficulty="medium"
        )
        
        return {
            "success": True,
            "game_id": game_id,
            "message": "Game started!",
            "code_lines": snippet["lines"],
            "language": snippet["language"],
            "filename": snippet["filename"],
            "bug_position": game_state.get_bug_position(),
            "compiler_scan_position": game_state.compiler_scan_position,
            "scan_speed": game_state.scan_speed
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/compiler-scan-status", response_model=CompilerScanResponse)
def get_compiler_scan_status():
    """Get current compiler scan status and update position"""
    status = game_state.update_compiler_scan()
    return CompilerScanResponse(**status)

@router.post("/stop-game")
def stop_game():
    """Stop the current game (when player finds bug or uses portal)"""
    game_state.stop_compiler_scan()
    return {"message": "Game stopped", "success": True}
def generate_code():
    """Returns a random fake code snippet with lines array"""
    try:
        with open(os.path.join("static", "code_snippets.json"), "r") as f:
            snippets = json.load(f)
        
        snippet = random.choice(snippets)
        
        # Split code into lines array
        lines = snippet["code"].split('\n')
        
        return CodeSnippetResponse(
            lines=lines,
            language=snippet["language"],
            filename=snippet["filename"],
            total_lines=len(lines)
        )
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Code snippets file not found")

@router.post("/scan-bug-position", response_model=ScanBugResponse)
def scan_bug_position(request: ScanBugRequest):
    """Checks if the bug is hidden at the scanned position"""
    # Check if it's an exact hit
    if game_state.is_exact_bug_position(request.line, request.column):
        # Player found the bug! Stop the compiler scan
        game_state.stop_compiler_scan()
        return ScanBugResponse(hit=True, message="Direct hit! Bug found! You escaped the compiler!")
    
    # Check if it's near the bug
    if game_state.is_position_near_bug(request.line, request.column):
        # Check for interference from nearby fake errors
        nearby_fake_errors = game_state.get_nearby_fake_errors(request.line, request.column)
        
        # More fake errors nearby = lower chance of detection
        interference_factor = len(nearby_fake_errors) * 0.1
        detection_chance = max(0.3, 0.6 - interference_factor)
        
        if random.random() < detection_chance:
            return ScanBugResponse(hit=True, message="Bug detected nearby! Keep searching...")
        else:
            return ScanBugResponse(hit=False, message="Something's not right here...")
    
    # Far miss
    return ScanBugResponse(hit=False, message="No bug detected at this location")

@router.post("/update-stats")
def update_stats(request: UpdateStatsRequest):
    """Stores player stats in memory"""
    player_stat = PlayerStats(
        player_name=request.player_name,
        time_survived=request.time_survived,
        status=request.status,
        bug_location=request.bug_location
    )
    game_state.add_player_stats(player_stat)
    return {"message": "Stats updated successfully"}

@router.get("/game-stats")
def get_game_stats():
    """Get current game statistics"""
    return {
        "time_survived": game_state.get_time_survived(),
        "bug_position": game_state.get_bug_position(),
        "compiler_scan_position": game_state.compiler_scan_position,
        "game_active": game_state.compiler_scan_active,
        "fake_errors_count": len(game_state.get_fake_errors())
    }

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard():
    """Returns top 5 players with longest survival time"""
    return game_state.get_leaderboard(limit=5)

@router.get("/exit-portal", response_model=PortalResponse)
def get_exit_portal():
    """Returns a random portal location with line number and clue"""
    try:
        # Get a random portal from the exit_portals service
        portal_data = get_random_exit_portal()
        
        # Return using the PortalResponse model
        return PortalResponse(
            line=portal_data["line"],
            clue=portal_data["clue"],
            x=random.randint(50, 500),  # Random x coordinate for visual positioning
            y=random.randint(50, 400),  # Random y coordinate for visual positioning
            description=f"Exit Portal at line {portal_data['line']}: {portal_data['clue']}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating exit portal: {str(e)}")
