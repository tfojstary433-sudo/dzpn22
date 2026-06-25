import json

file_path = r'c:\Users\pakyv\Desktop\pff-website-master\src\data\cached_history.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

tournament_name = 'Mecze Towarzyskie 25/26 PFF'
matches = {}
player_stats = {}
gk_stats = {}

for player_id, player_data in data['players'].items():
    player_name = player_data['name']
    for match in player_data['matches']:
        if match.get('tournamentName') == tournament_name:
            muid = match['matchUuid']
            
            if muid not in matches:
                matches[muid] = {
                    'teamA': match['teamA'],
                    'teamB': match['teamB'],
                    'scoreA': match['scoreA'],
                    'scoreB': match['scoreB'],
                    'playedAt': match['playedAt']
                }
            
            goals = match.get('goals', [])
            if goals:
                if player_name not in player_stats:
                    player_stats[player_name] = {'goals': 0, 'team': match['playerTeam']}
                player_stats[player_name]['goals'] += len(goals)
            
            pos = match.get('position')
            if pos in ['GK', 'BRAMKARZ']:
                if player_name not in gk_stats:
                    gk_stats[player_name] = {'clean_sheets': 0, 'minutes': 0, 'conceded_total': 0, 'matches_played': 0}
                
                minutes = match.get('minutesPlayed', 0)
                gk_stats[player_name]['minutes'] += minutes
                gk_stats[player_name]['matches_played'] += 1
                
                is_team_a = match['playerTeam'] == match['teamA']
                score_against = match['scoreB'] if is_team_a else match['scoreA']
                # Total conceded across all minutes for this match
                gk_stats[player_name]['conceded_total'] += score_against
                
                if score_against == 0 and minutes > 0:
                    gk_stats[player_name]['clean_sheets'] += 1

total_goals = sum(m['scoreA'] + m['scoreB'] for m in matches.values())
total_matches = len(matches)
avg_goals = total_goals / total_matches if total_matches > 0 else 0

top_scorers = sorted(player_stats.items(), key=lambda x: x[1]['goals'], reverse=True)[:5]
top_gks_cs = sorted(gk_stats.items(), key=lambda x: x[1]['clean_sheets'], reverse=True)[:5]
# Ratio: goals conceded per 90 mins (lower is better)
top_gks_ratio = sorted(
    [item for item in gk_stats.items() if item[1]['minutes'] > 0],
    key=lambda x: (x[1]['conceded_total'] / (x[1]['minutes'] / 90))
)[:5]

print(f'Tournament Summary: {tournament_name}')
print(f'1. Total goals: {total_goals} (deduplicated by matchUuid)')
print(f'4. Total matches: {total_matches}, Average goals: {avg_goals:.2f}')

print('\n2. Top 5 scorers:')
for name, stat in top_scorers:
    print(f'- {name} ({stat["team"]}): {stat["goals"]} goals')

print('\n3. Best goalkeepers (Clean Sheets):')
for name, stat in top_gks_cs:
    print(f'- {name}: {stat["clean_sheets"]} clean sheets ({stat["minutes"]} mins)')

print('\nBest goalkeepers (Ratio - conceded per 90m, min 45m played):')
eligible_gks = [item for item in gk_stats.items() if item[1]['minutes'] >= 45]
top_gks_ratio = sorted(
    eligible_gks,
    key=lambda x: (x[1]['conceded_total'] / (x[1]['minutes'] / 90))
)[:5]
for name, stat in top_gks_ratio:
    ratio = stat['conceded_total'] / (stat['minutes'] / 90)
    print(f'- {name}: {ratio:.2f} goals conceded/90m ({stat["conceded_total"]} conceded, {stat["minutes"]} mins)')

print('\nMatch Score Confirmations (from fixtures/matches list):')
matches_list = []
with open(r'c:\Users\pakyv\Desktop\pff-website-master\src\data\cached_matches_list.json', 'r', encoding='utf-8') as f:
    matches_list = json.load(f)

confirmations = {
    'tf-sf1-0103': 'Semifinal 1: Arka Gdynia vs Lechia Gdańsk',
    'tf-sf2-0103': 'Semifinal 2: Zawisza Bydgoszcz vs Sokół Olsztyn',
    'tf-3rd-0403': '3rd Place Match: Lechia Gdańsk vs Sokół Olsztyn',
    'tf-final-0403': 'Final: Zawisza Bydgoszcz vs Arka Gdynia'
}

for muid, label in confirmations.items():
    found = False
    for m in matches_list:
        if m['uuid'] == muid:
            print(f'{label}: {m["scoreA"]}:{m["scoreB"]}')
            found = True
            break
    if not found:
        print(f'{label}: NOT FOUND')
