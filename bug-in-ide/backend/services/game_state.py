from typing import List, Dict, Optional
import random
import time
import uuid
from models.game import PlayerStats, LeaderboardEntry


class GameState:
    def __init__(self):
        self.bug_position: Optional[Dict[str, int]] = None
        self.fake_errors: List[Dict[str, int]] = []
        self.player_stats: List[PlayerStats] = []
        self.current_game_id: Optional[str] = None
        self.game_start_time: Optional[float] = None
        self.current_code_snippet: Optional[Dict] = None
        
        # Compiler scan state
        self.compiler_scan_active: bool = False
        self.compiler_scan_position: Dict[str, int] = {"line": 1, "column": 1}
        self.scan_speed: float = 2.0  # seconds between scans
        self.last_scan_time: float = 0
        self.total_lines: int = 0
        self.max_columns_per_line: int = 80
    
    def set_bug_position(self, line: int, column: int) -> None:
        """Set the bug's position and place it strategically among fake errors"""
        self.bug_position = {"line": line, "column": column}
        
        # Generate fake errors around the bug position to make it harder to find
        self._generate_fake_errors_around_bug()
    
    def get_bug_position(self) -> Optional[Dict[str, int]]:
        """Get the current bug position"""
        return self.bug_position
    
    def _generate_fake_errors_around_bug(self) -> None:
        """Generate fake error positions around the bug to make it harder to find"""
        if not self.bug_position:
            return
        
        bug_line = self.bug_position["line"]
        bug_column = self.bug_position["column"]
        
        # Clear existing fake errors
        self.fake_errors = []
        
        # Generate 8-15 fake errors in the vicinity of the bug
        num_fake_errors = random.randint(8, 15)
        
        for _ in range(num_fake_errors):
            # Generate positions within a reasonable range of the bug
            fake_line = bug_line + random.randint(-10, 10)
            fake_column = bug_column + random.randint(-20, 20)
            
            # Ensure positions are positive
            fake_line = max(1, fake_line)
            fake_column = max(1, fake_column)
            
            # Don't place fake error exactly on the bug
            if fake_line != bug_line or fake_column != bug_column:
                self.fake_errors.append({
                    "line": fake_line,
                    "column": fake_column
                })
    
    def set_fake_errors(self, errors: List[Dict[str, int]]) -> None:
        """Manually set fake error positions"""
        self.fake_errors = errors
    
    def get_fake_errors(self) -> List[Dict[str, int]]:
        """Get all fake error positions"""
        return self.fake_errors
    
    def add_player_stats(self, player_stat: PlayerStats) -> None:
        """Add a player's game statistics"""
        self.player_stats.append(player_stat)
    
    def get_leaderboard(self, limit: int = 5) -> List[LeaderboardEntry]:
        """Get leaderboard sorted by survival time (descending)"""
        sorted_stats = sorted(
            self.player_stats, 
            key=lambda x: x.time_survived, 
            reverse=True
        )
        
        top_players = sorted_stats[:limit]
        
        return [
            LeaderboardEntry(
                player_name=stat.player_name,
                time_survived=stat.time_survived
            )
            for stat in top_players
        ]
    
    def reset_game(self) -> None:
        """Reset the game state (except player stats for leaderboard persistence)"""
        self.bug_position = None
        self.fake_errors = []
        self.current_game_id = None
        self.game_start_time = None
        self.current_code_snippet = None
        self.compiler_scan_active = False
        self.compiler_scan_position = {"line": 1, "column": 1}
        self.last_scan_time = 0
    
    def start_new_game(self, player_name: str, code_snippet: Dict, difficulty: str = "medium") -> str:
        """Start a new game session"""
        self.reset_game()
        self.current_game_id = str(uuid.uuid4())
        self.game_start_time = time.time()
        self.current_code_snippet = code_snippet
        self.total_lines = len(code_snippet.get("lines", []))
        
        # Set scan speed based on difficulty
        if difficulty == "easy":
            self.scan_speed = 3.0
        elif difficulty == "hard":
            self.scan_speed = 1.0
        else:  # medium
            self.scan_speed = 2.0
        
        # Generate a random bug position within the code
        if self.total_lines > 0:
            random_line = random.randint(1, self.total_lines)
            random_column = random.randint(1, 50)  # Reasonable column range
            self.set_bug_position(random_line, random_column)
        
        # Start compiler scan
        self.compiler_scan_active = True
        self.last_scan_time = time.time()
        
        return self.current_game_id
    
    def update_compiler_scan(self) -> Dict:
        """Update compiler scan position and return current status"""
        if not self.compiler_scan_active:
            return self._get_scan_status()
        
        current_time = time.time()
        if current_time - self.last_scan_time >= self.scan_speed:
            self._advance_scan_position()
            self.last_scan_time = current_time
            
            # Check if scan reached the bug
            if self._scan_reached_bug():
                self.compiler_scan_active = False
                return self._get_scan_status(game_over=True)
            
            # Check if scan finished all lines
            if self.compiler_scan_position["line"] > self.total_lines:
                self.compiler_scan_active = False
                return self._get_scan_status(game_over=True)
        
        return self._get_scan_status()
    
    def _advance_scan_position(self) -> None:
        """Advance the compiler scan to the next position"""
        current_line = self.compiler_scan_position["line"]
        current_column = self.compiler_scan_position["column"]
        
        # Move to next column
        current_column += 1
        
        # If we've reached the end of the line, move to next line
        if current_column > self.max_columns_per_line:
            current_column = 1
            current_line += 1
        
        # Update position
        self.compiler_scan_position = {
            "line": current_line,
            "column": current_column
        }
        
        # Debug print to see movement
        print(f"Compiler scan moved to line {current_line}, column {current_column}")
    
    def _scan_reached_bug(self) -> bool:
        """Check if the compiler scan has reached the bug position"""
        if not self.bug_position:
            return False
        
        scan_line = self.compiler_scan_position["line"]
        scan_column = self.compiler_scan_position["column"]
        bug_line = self.bug_position["line"]
        bug_column = self.bug_position["column"]
        
        # Check if scan has passed the bug position
        if scan_line > bug_line:
            return True
        elif scan_line == bug_line and scan_column >= bug_column:
            return True
        
        return False
    
    def _get_scan_status(self, game_over: bool = False) -> Dict:
        """Get current compiler scan status"""
        if not self.compiler_scan_active:
            progress = 100.0
            time_remaining = 0.0
        else:
            # Calculate progress based on position
            total_positions = self.total_lines * self.max_columns_per_line
            current_position = (self.compiler_scan_position["line"] - 1) * self.max_columns_per_line + self.compiler_scan_position["column"]
            progress = min(100.0, (current_position / total_positions) * 100)
            
            # Estimate time remaining
            remaining_positions = total_positions - current_position
            time_remaining = remaining_positions * self.scan_speed
        
        elapsed_time = time.time() - self.game_start_time if self.game_start_time else 0
        
        return {
            "scan_status": {
                "current_line": self.compiler_scan_position["line"],
                "current_column": self.compiler_scan_position["column"],
                "is_active": self.compiler_scan_active,
                "scan_speed": self.scan_speed,
                "progress_percentage": progress,
                "estimated_time_remaining": time_remaining
            },
            "game_active": self.compiler_scan_active and not game_over,
            "time_elapsed": elapsed_time,
            "game_over": game_over
        }
    
    def stop_compiler_scan(self) -> None:
        """Stop the compiler scan (when bug is found by player)"""
        self.compiler_scan_active = False
    
    def get_time_survived(self) -> float:
        """Get time survived in current game"""
        if not self.game_start_time:
            return 0.0
        return time.time() - self.game_start_time
    
    def is_position_near_bug(self, line: int, column: int, tolerance_line: int = 2, tolerance_column: int = 5) -> bool:
        """Check if a position is near the bug within given tolerance"""
        if not self.bug_position:
            return False
        
        line_diff = abs(line - self.bug_position["line"])
        column_diff = abs(column - self.bug_position["column"])
        
        return line_diff <= tolerance_line and column_diff <= tolerance_column
    
    def is_exact_bug_position(self, line: int, column: int) -> bool:
        """Check if the position is exactly where the bug is hidden"""
        if not self.bug_position:
            return False
        
        return (line == self.bug_position["line"] and 
                column == self.bug_position["column"])
    
    def get_nearby_fake_errors(self, line: int, column: int, radius: int = 3) -> List[Dict[str, int]]:
        """Get fake errors near a given position (used for scan interference logic)"""
        nearby_errors = []
        
        for error in self.fake_errors:
            line_diff = abs(error["line"] - line)
            column_diff = abs(error["column"] - column)
            
            if line_diff <= radius and column_diff <= radius:
                nearby_errors.append(error)
        
        return nearby_errors


# Global game state instance
game_state = GameState()

# Initialize with a default bug position for testing
game_state.set_bug_position(15, 23)
