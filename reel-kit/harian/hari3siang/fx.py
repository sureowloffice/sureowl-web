import json
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};T=d['T'];A=lambda n:S[n][0]
c4=A('c4-muter');lah=S['c6-lah'][1]-.55
FX={'punch':[T['2'][0]+.55,c4+3.4,A('c5-menang')+.8,lah],'shake':[c4+3.4,A('c5-menang')+.8],'freeze':[[lah,.5]],
 'comic':[[c4+3.4,'burst','GEDUBRAK!',.5,.62],[c4+3.45,'dust','',.5,.5],[A('c5-menang')+.3,'rays','',.5,.5],[A('c5-menang')+.5,'sparkle','',.5,.5],[T['2'][0]+.55,'speed','',.5,.5],[A('c6-lah')+.2,'speed','HAH?',.7,.55]],
 'rx':[['b',c4+4.4],['c',A('c6-lah')+.05]]}
s=open('data.js').read().split(';window.FX=')[0].rstrip(';')+';';open('data.js','w').write(s+'window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(FX['rx'],lah)
