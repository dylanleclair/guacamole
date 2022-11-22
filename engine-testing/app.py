
# Standard Library Dependencies
import os   # Used for path validation & platform confirmation

# Third Party Dependencies
from stockfish import Stockfish                     # Used to interface with stockfish binary
from flask import Flask,Response, request, jsonify  # Provides methods for HTTP server implementation

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

# Initialize flask app
app = Flask(__name__)

# Set configuration parameters, SEE: https://github.com/zhelyabuzhsky/stockfish#:~:text=can%20be%20modified.-,%7B%0A%20%20%20%20%22Debug%20Log%20File%22%3A%20%22%22%2C%0A%20%20%20%20%22Contempt%22%3A,%22UCI_LimitStrength%22%3A%20%22false%22%2C%0A%20%20%20%20%22UCI_Elo%22%3A%201350%0A%7D,-You%20can%20change
parameters = {
    "MultiPV": 3, # Output the N best lines, in this case 3 best lines
}

# Initialize stockfish engine NOTE: this is global state
stockfish = Stockfish(path=stockfish_path, depth=18, parameters=parameters)

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
    content = request.json["fen"]
    stockfish.set_fen_position(content)
    move = stockfish.get_best_move()
    response = {
        "move":move,
        "top_3":stockfish.get_top_moves(3), # https://github.com/zhelyabuzhsky/stockfish#get-info-on-the-top-n-moves
        "wdl":stockfish.get_wdl_stats() # https://github.com/zhelyabuzhsky/stockfish#get-stockfishs-windrawloss-stats-for-the-side-to-move-in-the-current-position
    }
    return jsonify(response)

if __name__ == '__main__': # if app.py is run directly
    app.run(host="0.0.0.0", port=8228)
