import pandas as pd

filename = "data.xlsx"

points = pd.read_excel(filename, 'points')
dottedlines = pd.read_excel(filename, 'dotted lines')

print(points)
print(dottedlines)

out = '''
export default 
{
    "PEOPLE" : [
'''

for _, row in points.iterrows():
    out += ('{ "name" : "%(name)s", "x" : %(x)s, "y" : %(y)s, "color" : "%(color)s", "dottedcolor" : "%(dottedcolor)s" }' 
            % {"name" : row['name'], "x" : row.x, "y" : row.y, "color" : row.color, "dottedcolor" : row.dottedcolor if pd.notnull(row.dottedcolor) else 'none'})
    out += ','

out = out[:-1] # get rid of trailing comma


out += '''], 
    "LINES" : [
        '''

for _, row in dottedlines.iterrows():
    out += ('{ "dir" : "%(dir)s", "loc" : %(loc)s, "color" : "%(color)s", "comment" : "%(comment)s" }' 
            % {"dir" : row['h or v'], "loc" : row.location, "color" : row.color, "comment" : row.comment})
    out += ','

out = out[:-1] # remove trailing comma
out += '''
    ]
};
'''

print(out)

with open('people.js', 'w') as f:
    f.write(out)