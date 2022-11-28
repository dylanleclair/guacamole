
# Standard Library Dependencies
import os   # Used for path validation & platform confirmation

# Third Party Dependencies
import chess                                              # Used to help interface with stockfish
import chess.engine                                       # Used to actually interface with stockfish
from flask import Flask,Response, request, make_response  # Provides methods for HTTP server implementation

# Initialize flask app
app = Flask(__name__)

# Locate stockfish folder as absolute path relative to this python files' location
stockfish_folder = os.path.join(
    os.path.abspath(os.path.dirname(__file__)),
    "stockfish_binaries" 
)

# Determine which stockfish binary to use based on OS
if os.name == "nt": # windows
    stockfish_path = os.path.join(stockfish_folder, "windows.exe")
else: # linux
    stockfish_path = os.path.join(stockfish_folder, "stockfish")

engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)

@app.route("/")
async def index() -> str:
    """The homepage that provides some info to people who stumble on it

    Returns
    -------
    Str
        Some plain unstyled html with information for the user
    """
    return "Hey there, send a JSON post request to /fen to get the best move<br><br>It should be in the format <br>  {<br>  'fen' : fen_position<br>}"

@app.route("/fen", methods=["POST"])
async def sendfen() -> Response:
    """Allows you to send a fen position to stockfish and get a response with:
        1. best move
        2. top 3
        3. wdl (win, draw, loss)

    Returns
    -------
    Response
        A JSON response with the calculated best move, top 3 and wdl
        
    Example
    -------
    (Assumes server is running on port 8228)
    ```
    import requests
    r = requests.post( 
        "http://localhost:8228/fen", 
        json={ "fen":"6qk/8/5P1p/8/8/6QP/5PP1/4R1K1 w - - 0 1"}
    )
    r.json() # {'move': 'e1e8',
                'top_3': [
                    {'Centipawn': None,'Mate': 2, 'Move': 'e1e8'},
                    {'Centipawn': None, 'Mate': 3, 'Move': 'g3c7'},
                    {'Centipawn': 6288, 'Mate': None, 'Move': 'g3g8'}
                ], 
                'wdl': [1000, 0, 0]}
    ```
    """
    try:
        content = request.json["fen"]
        board = chess.Board(content)
        if board.is_valid():
            analysis = engine.analyse(board, chess.engine.Limit(time=0.1))
            wdl = analysis["score"].relative.wdl()
            resp = {
                "move": str(analysis["pv"][0]),
                "top_3": list(map(lambda x: str(x), analysis["pv"][0:3])),
                "wdl": [wdl.wins, wdl.draws, wdl.losses]
            }
            return resp
        else:
            return make_response("Invalid FEN", 400)
    except ValueError:
        return make_response("Invalid FEN", 400)

if __name__ == '__main__': # if app.py is run directly
    app.run(host="0.0.0.0", port=8228)
