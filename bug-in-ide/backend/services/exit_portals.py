import random
from typing import Dict, List


class ExitPortal:
    def __init__(self, line: int, clue: str):
        self.line = line
        self.clue = clue
    
    def to_dict(self) -> Dict:
        return {"line": self.line, "clue": self.clue}


# Predefined list of exit portals with line numbers and clues
EXIT_PORTALS = [
    ExitPortal(5, "Look where functions begin their journey"),
    ExitPortal(12, "The middle ground holds secrets"),
    ExitPortal(18, "Where loops end, freedom starts"),
    ExitPortal(25, "The final return statement awaits"),
    ExitPortal(8, "Between the imports and the logic"),
    ExitPortal(33, "Deep in the nested conditions"),
    ExitPortal(41, "Where exceptions are handled with care"),
    ExitPortal(15, "The heart of the algorithm beats here"),
    ExitPortal(28, "Where variables get their final values"),
    ExitPortal(37, "In the shadow of the closing brace"),
    ExitPortal(3, "Near the top, before the real work begins"),
    ExitPortal(44, "At the end of all things"),
    ExitPortal(21, "Where the main logic branches"),
    ExitPortal(11, "Just after the setup, before the action"),
    ExitPortal(39, "In the cleanup section of the code"),
    ExitPortal(7, "Where constants are defined"),
    ExitPortal(30, "In the depths of the processing loop"),
    ExitPortal(16, "Where the critical calculation happens"),
    ExitPortal(23, "At the decision point of the algorithm"),
    ExitPortal(35, "Where error handling meets success")
]


def get_random_exit_portal() -> Dict:
    """
    Returns a random exit portal with line number and clue.
    
    Returns:
        Dict: A dictionary containing 'line' (int) and 'clue' (str)
    """
    portal = random.choice(EXIT_PORTALS)
    return portal.to_dict()


def get_portal_by_line(line_number: int) -> Dict:
    """
    Returns a specific portal by line number if it exists.
    
    Args:
        line_number (int): The line number to search for
        
    Returns:
        Dict: Portal data if found, None otherwise
    """
    for portal in EXIT_PORTALS:
        if portal.line == line_number:
            return portal.to_dict()
    return None


def get_all_portals() -> List[Dict]:
    """
    Returns all available exit portals.
    
    Returns:
        List[Dict]: List of all portal dictionaries
    """
    return [portal.to_dict() for portal in EXIT_PORTALS]


def add_custom_portal(line: int, clue: str) -> None:
    """
    Add a custom exit portal to the list.
    
    Args:
        line (int): Line number for the portal
        clue (str): Clue text for the portal
    """
    EXIT_PORTALS.append(ExitPortal(line, clue))


def get_portals_in_range(start_line: int, end_line: int) -> List[Dict]:
    """
    Get all portals within a specific line range.
    
    Args:
        start_line (int): Starting line number (inclusive)
        end_line (int): Ending line number (inclusive)
        
    Returns:
        List[Dict]: List of portals within the range
    """
    return [
        portal.to_dict() 
        for portal in EXIT_PORTALS 
        if start_line <= portal.line <= end_line
    ]
