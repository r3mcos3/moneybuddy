# Database Migratie Instructies

## Wat is er veranderd?

De terugkerende transacties zijn nu verbeterd:
- In plaats van een volledige datum, sla je nu alleen de **dag van de maand** op (1-31)
- Je bepaalt zelf wanneer je transacties verwerkt door op de knop te drukken
- Wanneer je verwerkt, krijgen transacties automatisch de juiste datum (de ingestelde dag van de huidige maand)

Bijvoorbeeld:
- Huur ingesteld op dag 1
- Je drukt op 5 januari op "Verwerk Transacties"
- De transactie wordt aangemaakt met datum 1 januari

## Migraties toepassen

Je moet twee nieuwe migraties toepassen op je Supabase database:

### Optie 1: Via Supabase Dashboard (Aanbevolen)

1. Ga naar [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecteer je project
3. Ga naar **SQL Editor** in het linker menu
4. Maak een nieuwe query aan
5. Kopieer en plak de inhoud van `supabase/migrations/20260126000000_fix_recurring_transaction_dates.sql`
6. Klik op **Run** om de migratie uit te voeren
7. Herhaal stappen 4-6 voor `supabase/migrations/20260126000001_recurring_day_of_month.sql`

### Optie 2: Via Supabase CLI

Als je de Supabase CLI hebt geïnstalleerd:

```bash
# Link je project (als je dit nog niet hebt gedaan)
supabase link --project-ref jouw-project-ref

# Push de migraties
supabase db push
```

## Na de migratie

1. Refresh je browser op http://localhost:3000
2. Ga naar de "Terugkerende Transacties" pagina
3. Je bestaande terugkerende transacties behouden hun dag (uit de oude start_date)
4. Bij nieuwe terugkerende transacties kun je de dag van de maand selecteren (1-31)
5. De "Verwerk Transacties" knop is nu altijd zichtbaar

## Testen

1. Maak een nieuwe terugkerende transactie aan
2. Kies bijvoorbeeld "15ste van de maand"
3. Klik op "Verwerk Transacties"
4. Check dat de transactie de juiste datum heeft (15e van de huidige maand)

## Hulp nodig?

Als je problemen hebt, laat het me weten!
