import pandas as pd

# Load the data from the Excel file
file_path = 'data/suburb_prices.xlsx'
df = pd.read_excel(file_path)

# List of 348 suburbs to keep (original list)
suburbs_to_keep = [
    "Abbotsford", "Aberfeldie", "Airport West", "Albanvale", "Albert Park", "Albion", "Alphington", "Altona", 
    "Altona Meadows", "Altona North", "Ardeer", "Armadale", "Ascot Vale", "Ashburton", "Ashwood", "Aspendale", 
    "Aspendale Gardens", "Attwood", "Avondale Heights", "Avonsleigh", "Bacchus Marsh", "Balaclava", "Balwyn", 
    "Balwyn North", "Bayswater", "Bayswater North", "Beaconsfield", "Beaconsfield Upper", "Beaumaris", "Belgrave", 
    "Bellfield", "Bentleigh", "Bentleigh East", "Berwick", "Black Rock", "Blackburn", "Blackburn North", 
    "Blackburn South", "Bonbeach", "Boronia", "Botanic Ridge", "Box Hill", "Braybrook", "Briar Hill", "Brighton", 
    "Brighton East", "Broadmeadows", "Brookfield", "Brooklyn", "Brunswick", "Brunswick East", "Brunswick West", 
    "Bulla", "Bulleen", "Bullengarook", "Bundoora", "Burnley", "Burnside", "Burnside Heights", "Burwood", 
    "Burwood East", "Cairnlea", "Camberwell", "Campbellfield", "Canterbury", "Carlton", "Carlton North", "Carnegie", 
    "Caroline Springs", "Carrum", "Carrum Downs", "Caulfield", "Caulfield East", "Caulfield North", "Caulfield South", 
    "Chadstone", "Chelsea", "Chelsea Heights", "Cheltenham", "Chirnside Park", "Clarinda", "Clayton", "Clayton South", 
    "Clifton Hill", "Clyde North", "Coburg", "Coburg North", "Coldstream", "Collingwood", "Coolaroo", "Craigieburn", 
    "Cranbourne", "Cranbourne East", "Cranbourne North", "Cranbourne West", "Cremorne", "Croydon", "Croydon Hills", 
    "Croydon North", "Croydon South", "Dallas", "Dandenong", "Dandenong North", "Darley", "Deepdene", "Deer Park", 
    "Delahey", "Derrimut", "Diamond Creek", "Diggers Rest", "Dingley Village", "Docklands", "Doncaster", 
    "Doncaster East", "Donvale", "Doreen", "Doveton", "Eaglemont", "East Melbourne", "Edithvale", "Elsternwick", 
    "Eltham", "Eltham North", "Elwood", "Emerald", "Endeavour Hills", "Epping", "Essendon", "Essendon North", 
    "Essendon West", "Eumemmerring", "Eynesbury", "Fairfield", "Fawkner", "Ferntree Gully", "Ferny Creek", "Fitzroy", 
    "Fitzroy North", "Flemington", "Footscray", "Forest Hill", "Frankston", "Frankston North", "Frankston South", 
    "Gardenvale", "Gisborne", "Gisborne South", "Gladstone Park", "Glen Huntly", "Glen Iris", "Glen Waverley", 
    "Glenroy", "Gowanbrae", "Greensborough", "Greenvale", "Guys Hill", "Hadfield", "Hallam", "Hampton", "Hampton East", 
    "Hampton Park", "Hawthorn", "Hawthorn East", "Healesville", "Heatherton", "Heathmont", "Heidelberg", 
    "Heidelberg Heights", "Heidelberg West", "Highett", "Hillside", "Hopetoun Park", "Hoppers Crossing", "Hughesdale", 
    "Huntingdale", "Hurstbridge", "Ivanhoe", "Ivanhoe East", "Jacana", "Kalkallo", "Kealba", "Keilor", "Keilor Downs", 
    "Keilor East", "Keilor Lodge", "Keilor Park", "Kensington", "Kew", "Kew East", "Keysborough", "Kilsyth", 
    "Kings Park", "Kingsbury", "Kingsville", "Knoxfield", "Kooyong", "Kurunjang", "Lalor", "Langwarrin", "Laverton", 
    "Lilydale", "Lower Plenty", "Lynbrook", "Lysterfield", "MacLeod", "Maidstone", "Malvern", "Malvern East", 
    "Maribyrnong", "McKinnon", "Meadow Heights", "Melbourne", "Melton", "Melton South", "Melton West", "Mentone", 
    "Menzies Creek", "Mernda", "Mickleham", "Middle Park", "Mill Park", "Mitcham", "Monbulk", "Mont Albert", 
    "Montmorency", "Montrose", "Moonee Ponds", "Moorabbin", "Mooroolbark", "Mordialloc", "Mount Evelyn", 
    "Mount Waverley", "Mulgrave", "Murrumbeena", "Narre Warren", "New Gisborne", "Newport", "Niddrie", "Noble Park", 
    "North Melbourne", "North Warrandyte", "Northcote", "Notting Hill", "Nunawading", "Oak Park", "Oakleigh", 
    "Oakleigh East", "Oakleigh South", "Officer", "Olinda", "Ormond", "Pakenham", "Parkdale", "Parkville", 
    "Pascoe Vale", "Patterson Lakes", "Plenty", "Plumpton", "Point Cook", "Port Melbourne", "Prahran", "Preston", 
    "Princes Hill", "Research", "Reservoir", "Richmond", "Riddells Creek", "Ringwood", "Ringwood East", 
    "Ringwood North", "Ripponlea", "Rockbank", "Rosanna", "Rowville", "Roxburgh Park", "Sandhurst", "Sandringham", 
    "Scoresby", "Seabrook", "Seaford", "Seaholme", "Seddon", "Silvan", "Skye", "South Kingsville", "South Melbourne", 
    "South Morang", "South Yarra", "Southbank", "Spotswood", "Springvale", "Springvale South", "St Albans", 
    "St Helena", "St Kilda", "Strathmore", "Strathmore Heights", "Sunbury", "Sunshine", "Sunshine North", 
    "Sunshine West", "Surrey Hills", "Sydenham", "Tarneit", "Taylors Hill", "Taylors Lakes", "Tecoma", "Templestowe", 
    "Templestowe Lower", "The Basin", "Thomastown", "Thornbury", "Toorak", "Travancore", "Truganina", "Tullamarine", 
    "Upwey", "Vermont", "Vermont South", "Viewbank", "Wallan", "Wandin North", "Wantirna", "Wantirna South", 
    "Warrandyte", "Warranwood", "Waterways", "Watsonia", "Watsonia North", "Wattle Glen", "Werribee", "Werribee South", 
    "West Footscray", "West Melbourne", "Westmeadows", "Wheelers Hill", "Whittlesea", "Wildwood", "Williams Landing", 
    "Williamstown", "Williamstown North", "Windsor", "Wollert", "Wonga Park", "Wyndham Vale", "Yallambie", 
    "Yarra Glen", "Yarraville"
]

# Convert to uppercase to keep only matching rows in uppercase
suburbs_to_keep_upper = [suburb.upper() for suburb in suburbs_to_keep]

# Filter and convert suburb names in DataFrame to uppercase
df['Unnamed: 0'] = df['Unnamed: 0'].str.upper()
filtered_df = df[df['Unnamed: 0'].isin(suburbs_to_keep_upper)]

# Save the filtered DataFrame back to Excel, ensuring suburb names are in uppercase
filtered_df.to_excel('filtered_suburb_prices_uppercase.xlsx', index=False)
print("Filtered file saved as 'filtered_suburb_prices_uppercase.xlsx'")
