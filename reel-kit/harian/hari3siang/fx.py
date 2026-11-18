import json
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};T=d['T'];A=lambda n:S[n][0];RV=d['REV']
c4=A('c4-muter');lah=A('c6c-ember')+.12
FX={'punch':[T['S2'][0]+.55,c4+3.4,RV,lah,A('c6b-pov')],'shake':[c4+3.4,c4+3.5,RV],'freeze':[[lah,.5]],
 'comic':[[c4+3.4,'burst','GEDUBRAK!',.5,.62],[c4+3.45,'dust','',.5,.5],[RV,'rays','',.5,.5],[RV+.1,'sparkle','',.5,.5],[RV+1.2,'sparkle','',.5,.5],[T['S2'][0]+.55,'speed','',.5,.5],[A('c6a-cari')+.1,'speed','',.5,.5],[T['S5b'][0],'gloom','',.5,.5]],
 'rx':[['b',A('c5-menang')+.05],['c',RV+1.0]],'cards':[A('c2-komen')+.15+k*.9 for k in range(4)]}
s=open('data.js').read().split(';window.FX=')[0].rstrip(';')+';';open('data.js','w').write(s+'window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(FX['rx'],lah,RV)
