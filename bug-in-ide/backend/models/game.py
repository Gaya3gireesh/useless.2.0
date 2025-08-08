from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ScanBugRequest(BaseModel):
    """Request model for scanning bug position"""
    line: int
    column: int


class ScanBugResponse(BaseModel):
    """Response model for scan results"""
    hit: bool
    message: str


class UpdateStatsRequest(BaseModel):
    """Request model for submitting player statistics"""
    player_name: str
    time_survived: float
    status: str  # e.g., "escaped", "caught", "timeout"
    bug_location: Dict[str, int]  # {"line": int, "column": int}


class PlayerStats(BaseModel):
    """Model for storing complete player statistics"""
    player_name: str
    time_survived: float
    status: str
    bug_location: Dict[str, int]


class LeaderboardEntry(BaseModel):
    """Model for leaderboard entries"""
    player_name: str
    time_survived: float


class PortalResponse(BaseModel):
    """Response model for exit portal information"""
    line: int
    clue: str
    x: Optional[int] = None  # Visual x coordinate
    y: Optional[int] = None  # Visual y coordinate
    description: Optional[str] = None


class CodeSnippetResponse(BaseModel):
    """Response model for code snippet with array of lines"""
    lines: List[str]
    language: str
    filename: str
    total_lines: int


class CodeSnippet(BaseModel):
    """Legacy model for backward compatibility"""
    code: str
    language: str
    filename: str


class PortalLocation(BaseModel):
    """Legacy model for portal location"""
    x: int
    y: int
    description: str


class GameStateResponse(BaseModel):
    """Response model for current game state"""
    bug_position: Optional[Dict[str, int]]
    fake_errors_count: int
    players_count: int


class ErrorPosition(BaseModel):
    """Model for error positions"""
    line: int
    column: int
    error_type: Optional[str] = "syntax"
    message: Optional[str] = "Error detected"


class GameConfigRequest(BaseModel):
    """Request model for configuring game settings"""
    bug_line: int
    bug_column: int
    difficulty: Optional[str] = "medium"  # easy, medium, hard


class GameConfigResponse(BaseModel):
    """Response model for game configuration confirmation"""
    success: bool
    message: str
    bug_position: Dict[str, int]
    fake_errors_generated: int


class StartGameRequest(BaseModel):
    """Request model for starting a new game"""
    player_name: str
    difficulty: Optional[str] = "medium"
    auto_scan: Optional[bool] = True  # Enable automatic compiler scan


class StartGameResponse(BaseModel):
    """Response model for game start confirmation"""
    success: bool
    game_id: str
    message: str
    code_snippet: CodeSnippetResponse
    compiler_scan_position: Dict[str, int]
    scan_speed: float  # seconds between scans


class CompilerScanStatus(BaseModel):
    """Model for compiler scan status"""
    current_line: int
    current_column: int
    is_active: bool
    scan_speed: float
    progress_percentage: float
    estimated_time_remaining: float


class CompilerScanResponse(BaseModel):
    """Response model for compiler scan updates"""
    scan_status: CompilerScanStatus
    game_active: bool
    time_elapsed: float
