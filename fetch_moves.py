import requests
import json

def fetch_all_moves():
    url = "https://pokeapi.co/api/v2/move?limit=10000"
    response = requests.get(url)
    data = response.json()
    
    z_moves = {
        "catastropika", "sinister-arrow-raid", "malicious-moonsault", 
        "oceanic-operetta", "guardian-of-alola", "soul-stealing-7-star-strike", 
        "stoked-sparksurfer", "pulverizing-pancake", "extreme-evoboost", 
        "genesis-supernova", "10-000-000-volt-thunderbolt", "light-that-burns-the-sky", 
        "searing-sunraze-smash", "menacing-moonraze-maelstrom", "lets-snuggle-forever", 
        "splintered-stormshards", "clangorous-soulblaze"
    }
    
    moves = []
    for item in data['results']:
        name = item['name']
        if name.startswith('max-'):
            continue
        if name.endswith('--physical') or name.endswith('--special'):
            continue
        if name in z_moves:
            continue
        moves.append(name)
    
    with open('client/src/data/moves.json', 'w') as f:
        json.dump(moves, f, indent=2)
        
    print(f"Successfully fetched {len(moves)} moves.")

if __name__ == "__main__":
    fetch_all_moves()
