# 07 — Phase 3: Diet & Nutrition (with Food Scan)

The eating side of the product. Introduces the **Python FastAPI ML microservice**.

## User stories
- As a user, I enter my **body metrics** (height, weight, age, sex, activity level) and get **calorie + macro targets**.
- As a user, I can **log meals** by searching open food databases or scanning a **barcode**.
- As a user, I can **scan/photograph a food platter** and get an estimated nutrition breakdown.
- As a user, I get **diet plan suggestions** based on my body, goal (lose/maintain/gain), and activity.

## Sub-features & sequencing
1. **Body profile + targets (no ML):** BMI, BMR (Mifflin-St Jeor), TDEE, goal-adjusted calories + macros.
2. **Manual logging:** search Open Food Facts / USDA; log portions; daily totals vs. targets.
3. **Barcode scan:** Open Food Facts lookup (cheap win, no ML model).
4. **Food platter scan (ML):** image → dish recognition → nutrition estimate → confirm/adjust.
5. **Diet plan suggestions:** rule-based meal targets first; smarter later.

## Calculations (transparent, no black box for v1)
- **BMI** = weight(kg) / height(m)²
- **BMR** (Mifflin-St Jeor):
  - male: `10·kg + 6.25·cm − 5·age + 5`
  - female: `10·kg + 6.25·cm − 5·age − 161`
- **TDEE** = BMR × activity factor (1.2 – 1.9)
- **Goal**: deficit (−15–20%) / maintain / surplus (+10–15%)
- **Macros**: protein by bodyweight, fat %, carbs fill remainder.

## ML microservice (first real microservice)
```
Mobile/Web ── image ──▶ NestJS (nutrition module) ──▶ Python FastAPI (vision)
                                                   ◀── dish + confidence
NestJS ── maps dish ──▶ nutrition DB (USDA/OFF) ──▶ estimate ──▶ client confirms
```
- **POST /infer/food-image** (FastAPI): returns candidate dishes + confidence.
- NestJS owns business logic, portion mapping, and persistence.
- Keep model **swappable** (open model first; commercial fallback if accuracy is poor).
- Always let the user **confirm/adjust** the estimate — never present ML output as exact truth.

## API (NestJS)
```
PUT  /api/v1/me/body-profile
GET  /api/v1/me/nutrition/targets
GET  /api/v1/foods?q=            (Open Food Facts / USDA proxy + cache)
GET  /api/v1/foods/barcode/:code
POST /api/v1/me/meals            (log a meal)
GET  /api/v1/me/meals?date=
POST /api/v1/me/meals/scan       (multipart image → ML → estimate)
GET  /api/v1/me/diet-plan
```

## Data sources
Open Food Facts (products + barcodes), USDA FoodData Central (nutrients), open food-classification models for the scanner. See `04`.

## Privacy & safety
- Food photos may be sensitive → clear consent, retention policy, ability to delete.
- Show **disclaimers**: estimates are approximate; not medical/clinical advice.
- Don't give medical diet advice; stay in general fitness guidance.

## Definition of done
- [ ] Body profile → accurate targets shown.
- [ ] Manual + barcode logging against open data.
- [ ] Food-image scan returns an editable estimate via the ML service.
- [ ] Rule-based diet suggestions for lose/maintain/gain.
- [ ] Disclaimers + data-deletion in place.

## Risks
| Risk | Mitigation |
|------|-----------|
| Food recognition accuracy | User confirmation step; start with common dishes; commercial fallback |
| Portion size estimation | Ask user to confirm portion; reference sizes |
| Nutrition data gaps/locale | Combine OFF + USDA; allow manual entry |
