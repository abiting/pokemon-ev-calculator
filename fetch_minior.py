import requests
import json

def fetch_minior_varieties():
    url = "https://pokeapi.co/api/v2/pokemon-species/774/"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        varieties = data.get('varieties', [])
        print(json.dumps(varieties, indent=2))
    else:
        print(f"Failed to fetch Minior data: {response.status_code}")

if __name__ == "__main__":
    fetch_minior_varieties()
