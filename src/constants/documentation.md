# Machines
Ezen a honlapon lehetőséged van különböző matematikai gépeket, és formális nyelveket definiálni,
szimulálni, ezeken műveleteket végrehajtani és megjeleníteni. A program a nyelvek és automaták című BME-n 
okatott tárgyra épít ([jegyzet](http://www.cs.bme.hu/~friedl/nyau/jegyzet-13.pdf)).

Az oldal megnyitásakor bal oldalon van egy lista található, amelyben az adott listaelem szerkeszthető.
Új elemet az aktuálisan szerkesztett elem után a `alt` + `enter` parancsal tudunk beszúrni.

Saját magunk is definiálhatjuk a leíró szöveget, vagy a lenyíló `Add machine` menüvel tudunk példát betölteni.
Különböző típusú leíró szöveget készíthetünk el:
 - [Véges automata](#vges-automata)
 - [Veremautomata](#veremautomata)
 - [Turing-gép](#turing-gp)
 - [Kifejezés](#kifejezs)

A lista elemeit az `x`-re kattintva eltüntethetjük, 
a [konvertálás](#kifejezsbl-llapotgp) gombra (forgó nyíl) a kifejezésből gép konvertálását végezhetjük el.

Jobb oldalon láthatjuk a gráfos megjelenítését az adott gépünknek,
továbbá a hozzá tartozó átmenet táblázatot. 
Ezen a felületen van lehetőségünk a [szimuláció](#szimulci)-ra

## Véges automata
Vizsgáljuk meg a következő Véges automata kódját:
````yaml
FiniteAutomaton:
  name: M1
  charset: a, b
  states: S, K, A-B, R
  init: S
  accept: R
  transitions:
    - S . S
    - S $ K
    - K a A
    - A b B
    - B a R
    - R . R
````
YAML szintaxist használva a `name`-el adjuk meg az Véges automata nevét, a `charset`-el a bemeneti abc-t. A `states`-nél az egyes állapotokat,
az `init`-nél a kezdő állapotot, az `accept`-nél az elfogadó állapotokat, és végül a `transitions`-ban fogalmazzuk meg
az átmeneteket:
```
[induló állapot] [beolvasott karakter] [új állapot]
```
Bármelyik `[]` helyén használhatjuk a `.`-ot, amire a program a háttérben az összes lehetőséggel behelyettesíti
(állapotnál az összes állapotot, abc-nél meg az összes lehetséges karaktert). Például az `R . R` jelenti, hogy az
`R` állapotban bármilyen karaktert beolvasva az `R` állapotba jutunk.

Lehetőésünk van az `[új állapot]`-nál az `&` jel használatára, ha az `[induló állapot]`-nál a `.`-ot használtunk, ekkor
az `[új állapot]` mindig az `[induló állapot]`-al egyezik meg.
## Veremautomata
```yaml
PushdownAutomaton:
name: M1
charset: a, b
states: A-C
init: A
accept: B
transitions:
- A a a/b B
- B b b/a C
```

YAML szintaxist használva a `name`-el adjuk meg az veremautomata nevét, a `charset`-el a bemeneti abc-t. A `states`-nél az egyes állapotokat,
az `init`-nél a kezdő állapotot, az `accept`-nél az elfogadó állapotokat, és végül a `transitions`-ban fogalmazzuk meg
az átmeneteket:
```
[induló állapot] [beolvasott karakter] [veremről olvasott]/[veremre írt] [új állapot]
```
Bármelyik `[]` helyén használhatjuk a `.`-ot, amire a program a háttérben az összes lehetőséggel behelyettesíti
(állapotnál az összes állapotot, abc-nél meg az összes lehetséges karaktert). 


Lehetőésünk van az `[új állapot]`-nál az `&` jel használatára, ha az `[induló állapot]`-nál a `.`-ot használtunk, ekkor
az `[új állapot]` mindig az `[induló állapot]`-al egyezik meg. Ugyanez működik a `[veremről olvasott]` és a `[veremre írt]` karakterrel.
## Turing-gép
```yaml
TuringMachine:
  name: palindrom
  init: start
  charset: a, b
  states: start, haveA, haveB, 
          matchA, matchB, back,
          accept, reject
  accept: accept
  transitions:
    - start a/_ > haveA
    - start b/_ > haveB
    - start _/& > accept

    - haveA ./& > haveA
    - haveA _/& < matchA

    - haveB ./& > haveB
    - haveB _/& < matchB

    - matchA a/_ < back
    - matchA b/& > reject
    - matchA _/& > accept

    - matchB a/& > reject
    - matchB b/_ < back
    - matchB _/& > accept

    - back ./& < back
    - back _/& > start
```
YAML szintaxist használva a `name`-el adjuk meg az Turing-gép nevét, a `charset`-el a szalag abc-t. A `states`-nél az egyes állapotokat,
az `init`-nél a kezdő állapotot, az `accept`-nél az elfogadó állapotokat, és végül a `transitions`-ban fogalmazzuk meg
az átmeneteket:
```
[induló állapot] [olvasott karakter]/[írt karakter] [fej mozgatás] [új állapot]
```
Bármelyik `[]` helyén használhatjuk a `.`-ot, amire a program a háttérben az összes lehetőséggel behelyettesíti
(állapotnál az összes állapotot, abc-nél meg az összes lehetséges karaktert, fej mozgatásánál az összes irányt).
A fej mozgatásánál a `>` jobbra mozgatást, `<` balra, végül a `=` helyben hagyást jelenti.

Lehetőésünk van az `[új állapot]`-nál az `&` jel használatára, ha az `[induló állapot]`-nál a `.`-ot használtunk, ekkor
az `[új állapot]` mindig az `[induló állapot]`-al egyezik meg. Ugyanez működik a `[olvasott karakter]` és a `[írt karakter]` karakterrel.

A `_` karakter alapértelmezetten a szalag `abc` része, jelentése az üres karakter.
## Kifejezés
Lehetőségünk van kifejezés megadására is, amely a korábbi gépekre hivatkozva, hozhat létre új gépet.
Például egy Véges automataet minimalizálhatunk, vagy determinisztikussá tehetünk.

A következő szintaktikát használhatjuk:
```
M3 = union(M1, M2)
```

Ebben az esetben létrehozunk egy új Véges automataet az M1 és az M2 Véges automata uniójából.
Ebből kapunk egy új Véges automataet, és ezt egy másik listaelemben tudjuk használni M3 néven.


| Elérhető függvények                                    | Leírás                                                                                                                                      |
|:-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| *min(`FinalStateMachine`)*                             | létrehoz egy minimalizált Véges automataet                                                                                                      |
| *det(`FinalStateMachine`)*                             | determinizált Véges automataet készíti el a korábbiból                                                                                          |
| *union(`FinalStateMachine`, `FinalStateMachine`)*      | két Véges automata unióját adja vissza                                                                                                          |
| *difference(`FinalStateMachine`, `FinalStateMachine`)* | két Véges automata különbségét adja vissza                                                                                                      |
| *intersect(`FinalStateMachine`, `FinalStateMachine`)*  | két Véges automata metszetét adja vissza                                                                                                        |
| *available(`FinalStateMachine`)*                       | meghatároz egy új automatát, amelyet az előző Véges automata elérhető állapotaiból építi fel                                                    |
| *complement(`FinalStateMachine`)*                      | az eredeti Véges automata komplementer nyelvét elfogadó automatát adja vissza                                                                   |
| *epsfree(`FinalStateMachine`)*                         | visszaad egy epszilon átmenettől mentes Véges automataet                                                                                        |
| *concat(`FinalStateMachine`, `FinalStateMachine`)*                        | két Véges automatahez rendel egy olyan automatát, aminek a nyelvtana a két bemeneti Véges automata nyelvtanainak a konkatenáltja                    |
| *close(`FinalStateMachine`)*                           | a nyelv tranzitív lezártjához tartozó automatát adja vissza                                                                                 |
| *clean(`FinalStateMachine`)*                           | az összes állapotot veszi sorra, és az A, B, C nagybetűkön végigmenve átnevezi az állapotokat, ezzel a hosszú állapotnevek leegyszerűsödnek |


## Kifejezésből Véges automata
Legyen adott egy `M1` automatánk kódja a programunk számára az első lista elemben,
továbbá legyen ehhez egy kifejezés, például `M_2 = min(det(epsfree(M1)))` a másodikban.
Ekkor lehetőségünk van a második lista elem jobb felső sarkán lévő forgó nyílra kattintva 
átalakítani a kifejezést a gépet leíró nyelvére.

Például legyen a következő az `M1` Véges automata:
```yaml
FinalStateMachine:
name: M1
charset: a, b
states: S, K, A-B, R
init: S
accept: R
transitions:
  - S . S
  - S $ K
  - K a A
  - A b B
  - B a R
  - R . R
```
A kifejezés pedig:
```
M2=det(epsfree(M1))
```
Konvertálás gombra kattintva megkapjuk a kívánt eredményt:
```yaml
FinalStateMachine:
name: detefM1
charset: a, b
states: S, AS, BS, ARS, BRS, RS
init: S
accept: ARS, BRS, RS
transitions:
  - S a AS
  - S b S
  - AS a AS
  - AS b BS
  - BS a ARS
  - BS b S
  - ARS a ARS
  - ARS b BRS
  - BRS a ARS
  - BRS b RS
  - RS a ARS
  - RS b RS
```

## Szimuláció
A program az egyes gépek esetében támogatja a szimulációt,
ezzel megnézhetjük, hogy adott bemenetre, mi megy végbe a gépen.

A lap alján három akciót hajthatunk végre:
  - újrakezdés: futást leállítja, és visszaállítja az eredeti állapotba
  - lefuttatás: a teljes szimulációt lefuttatja, és a végső állapotban megáll
  - léptetés:
    - determinisztikus esetben a következő egyetlen átmenetet választva léptethetjük a gépet a következő állapotba
    - nem determinisztikus esetben kiválaszthatjuk melyik átmenet irányába szeretnénk tovább lépni
    - lehetőség van lépkedni a múltba visszafelé a gép állapotai között


A szalagot az akció gombok mellett láthatjuk jobb oldalt. 
A kijelölt piros hátterű karakternél tart az író olvasó fej 
(Véges automata esetében azt a megjelölt betűt olvassuk éppen).

A gráfos reprezentáción is követhetjük éppen hol tartunk,
mindig a megfelelő állapotot jelöli be vastag piros vonallal.


Turing-gép esetében a szalag automatikusan bővül, ha megy jobbra az író olvasó fej.

Amennyiben a gépünk nem determinisztikus lehetőség van dönteni,
hogy melyik irányt válassza a lehetőségek közül. Ezt a megfelelő átmenetre kattintva tehetjük meg.

Lehetőség van a korábbi állapotokat megtekinteni a futtatás során, 
így ha például egy nem determinisztikus döntésnek egy másik ágát szeretnénk megnézni, 
akkor visszaléphetünk egy korábbi döntésünkre, és választhatunk másképpen, majd ezzel az új döntéssel mehetünk tovább.

