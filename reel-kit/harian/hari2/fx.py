import json
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};TV=dict(zip(['L03','L05','L06','L07','L09','L10','L12a','L12b','L12c','L13','L14','L15','L16','L17','L18'],d['T']))
A=lambda n:S[n][0]
win=TV['L07'][1]-.75
FX={'punch':[A('b03-roti')+.55,A('b10-jempol')+.25,win,A('b13-jadi')+.6,A('b09-gerobak')+1.95],
 'shake':[A('b03-roti')+.55,A('b10-jempol')+.25,win,A('b09-gerobak')+1.95],
 'freeze':[[A('b03-roti')+.62,.5]],
 'comic':[[A('b03-roti')+1.2,'speed','HAH?!',.74,.6],[TV['L06'][1]-1.1,'gloom','GAK NAMBAH',.5,.6],[A('b09-gerobak')+.3,'sweat','',.5,.5],[A('b09-gerobak')+1.95,'burst','GLUDUK!',.3,.62],
  [A('b10-jempol')+.25,'burst','DUK!',.7,.5],[A('b13-jadi')+.3,'rays','',.5,.5],[A('b13-jadi')+.5,'sparkle','',.5,.5],[A('b14-kunci')+.4,'sparkle','',.5,.5],[A('b14-kunci')+2.6,'sparkle','',.5,.5],
  [TV['L15'][0],'think','',.5,.5],[A('b16-gelap')+.6,'gloom','',.5,.5],[A('b12-wapres')+.4,'speed','',.5,.5]]}
s=open('data.js').read().split(';window.FX=')[0].rstrip(';')+';'
open('data.js','w').write(s+'window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print('fx ok')
