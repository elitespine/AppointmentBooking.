import urllib.request
import re
import json

url = 'https://maps.app.goo.gl/XhMFHsvDzW13paGz5'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
html = urllib.request.urlopen(req).read().decode('utf-8')
start = html.find('window.APP_INITIALIZATION_STATE=')
if start != -1:
    end = html.find('window.APP_FLAGS=', start)
    state = html[start:end]
    
    # Try to find user names and review text patterns in the state string.
    # Reviews usually show up next to a username and rating.
    # Let's extract any string longer than 50 chars as a heuristic.
    strings = set(re.findall(r'\"([^\"]{40,})\"', state))
    for s in strings:
        if ' ' in s and not s.startswith('<') and not s.startswith('http') and not s.startswith('//'):
            print('-->', s.encode('utf-8', 'ignore').decode('utf-8'))
