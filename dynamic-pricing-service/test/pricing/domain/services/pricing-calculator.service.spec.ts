import {PricingCalculatorService} from "../../../../src/pricing/domain/services/pricing-calculator.service";


describe('PricingCalculatorService', () => {
    let service: PricingCalculatorService;

    beforeEach(() => {
        service = new PricingCalculatorService();
    });

    it('applies all three rules in sequence (peak season, high occupancy, high demand)', () => {
        // July = +20%, occupancy 0.9 = +15%, demand 0.8 = +10%
        // 100 * 1.2 * 1.15 * 1.1 = 151.8
        const result = service.calculate(100, new Date('2026-07-01'), 0.9, 0.8);
        expect(result).toBeCloseTo(151.8, 1);
    });

    it('applies all three rules in sequence (low season, low occupancy, low demand)', () => {
        // January = *0.8, occupancy 0.2 = *0.9, demand 0.1 = *0.95
        // 100 * 0.8 * 0.9 * 0.95 = 68.4
        const result = service.calculate(100, new Date('2026-01-15'), 0.2, 0.1);
        expect(result).toBeCloseTo(68.4, 1);
    });

    it('returns base price when no rules adjust it (shoulder season, mid occupancy, mid demand)', () => {
        const result = service.calculate(100, new Date('2026-04-10'), 0.5, 0.5);
        expect(result).toBe(100);
    });

    it('works correctly with different base prices', () => {
        // July +20% only (mid occupancy + demand = no change)
        const result = service.calculate(200, new Date('2026-07-01'), 0.5, 0.5);
        expect(result).toBeCloseTo(240);
    });
});