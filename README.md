# Smart Rental Property Analytics Platform

## 1. Poslovni problem

**Opredelitev problema**

Lastniki kratkoročnih najemnih nepremičnin (apartmaji, sobe, studii) se soočajo z naslednjimi izzivi:
- Ne vedo, ali je njihova zasedenost optimalna.
- Ne znajo določiti optimalne cene glede na sezono in povpraševanje.
- Težko analizirajo prihodke in uspešnost skozi čas.
- Nimajo enotnega sistema za spremljanje poslovanja.

**Namen sistema**

Sistem Smart Rental Property Analytics Platform omogoča lastnikom:
- Upravljanje nepremičnin in sob
- Analizo rezervacij in prihodkov
- Izračun kazalnikov uspešnosti (zasedenost, ADR, RevPAR)
- Generiranje dinamičnih cen na podlagi poslovnih pravil

Sistem združuje upravljanje podatkov, analitiko in inteligentno cenovno strategijo v enotni mikrostoritveni arhitekturi.

**Uporabniki sistema**

- Lastnik nepremičnine
  - Upravlja nepremičnine
  - Pregleduje analitiko
  - Sprejema cenovne odločitve


**Komunikacija komponent:**

Sistem je sestavljen iz več neodvisnih mikrostoritev, ki:
- Komunicirajo prek REST API (sinhrona komunikacija)
- Uporabljajo sporočilni posrednik za dogodke (asinhrona komunikacija)
- Vsaka storitev ima svojo lastno podatkovno bazo

---

## 2. Glavne domene in mikrostoritve

Sistem je razdeljen na tri glavne poslovne domene.

**1. Property Service - Domena: Upravljanje nepremičnin**

Odgovornosti:
- Ustvarjanje in upravljanje nepremičnin
- Upravljanje sob/enot
- Upravljanje osnovne cene
- Upravljanje dodatkov (amenities)
- Upravljanje razpoložljivosti

Ta storitev je vir resnice za vse podatke o ponudbi.

**2. Booking Analytics Service - Domena: Rezervacije, analitika in uspešnosti poslovanja**

Odgovornosti:
- Sprejem in shranjevanje rezervacij
- Izračun prihodkov
- Izračun zasedenosti
- Generiranje mesečnih poročil
- Izračun KPI kazalnikov (ADR - Average daily rate, RevPAR - revenue per available room)

Ta storitev obdeluje zgodovinske podatke in generira poslovne metrike.

**3. Pricing Strategy Service - Domena: Dinamično določanje cen**

Odgovornosti:
- Izračun priporočene cene
- Uporaba sezonskih faktorjev
- Uporaba faktorja zasedenosti
- Analiza kratkoročnega povpraševanja
- Primerjava s konkurenco (simulirano)
- Uveljavljanje cenovnih omejitev (min/max cena)

Ta storitev implementira prilagodljiv cenovni model.

---

## 3. Arhitektura sistema

Sistem sledi mikrostoritveni arhitekturi z ločenimi podatkovnimi bazami.

**Komunikacija:**
- Web aplikacija → mikrostoritve: REST API, gRPC
- Mikrostoritve med seboj (poizvedbe): REST API
- Dogodki (event-driven): sporočilni posrednik (npr. RabbitMQ ali Kafka)

**Podatkovna ločitev:**

Vsaka mikrostoritev ima svojo podatkovno bazo:
- Property Service → PropertyDB
- Booking Analytics Service → AnalyticsDB
- Pricing Strategy Service → PricingDB

Ni deljene baze podatkov, kar zagotavlja:
	•	Ohlapno sklopljenost
	•	Neodvisno skaliranje
	•	Jasne meje odgovornosti

**Diagram arhitekture**

![IT Architecture MS diagram N1](https://github.com/user-attachments/assets/858f341c-524e-434d-86ab-aff0a4f22f94)

---

## 4. Struktura repozitorija

Repozitorij je organiziran po poslovnih domenah (screaming architecture):
```
smart-rental-platform/
  │
  ├── property-service/
  │   ├── domain/
  │   ├── application/
  │   ├── infrastructure/
  │   └── interfaces/
  │
  ├── booking-analytics-service/
  │   ├── domain/
  │   ├── application/
  │   ├── infrastructure/
  │   └── interfaces/
  │
  ├── pricing-strategy-service/
  │   ├── domain/
  │   ├── application/
  │   ├── infrastructure/
  │   └── interfaces/
  │
  ├── web-app/
  │
  └── docs/
      └── architecture-diagram.png
...
```

**Načela organizacije:**

- Poslovna logika je ločena od infrastrukture.
- Odvisnosti tečejo od zunaj proti notranjosti.
- Struktura odraža poslovne koncepte, ne tehnologije.

## 5. Komunikacija med storitvami 

**REST API (sinhrona komunikacija)**

**Sporočilni posrednik (asinhrona komunikacija)**

S tem dosežemo ohlapno sklopljenost, razširljivost in boljšo odpornost sistema.

**Arhitekturna načela**

Sistem sledi načelom:
- Mikrostoritvena arhitektura
- Clean Architecture
- Ohlapna sklopljenost
- Ločene podatkovne baze
- Kombinacija sinhrone in asinhrone komunikacije
- Screaming Architecture

---

# Povzetek

Smart Rental Property Analytics Platform je mikrostoritveni sistem, ki omogoča:

- Upravljanje nepremičnin
- Analizo poslovne uspešnosti
- Inteligentno določanje cen

Arhitektura omogoča modularnost, razširljivost in jasno ločitev odgovornosti med poslovnimi domenami.



---

## Dokumentacija

- property service: /swagger-ui/index.html#/
- dynamic pricing service: /api/docs

## Tests

- npm run tests -- --coverage -> for dynamic pricing