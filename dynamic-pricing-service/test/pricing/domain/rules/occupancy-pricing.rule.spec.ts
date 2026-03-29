import {OccupancyPricingRule} from "../../../../src/pricing/domain/rules/occupancy-pricing.rule";


describe('OccupancyPricingRule', () => {
    let rule: OccupancyPricingRule;

    beforeEach(() => {
        rule = new OccupancyPricingRule();
    });

    it('applies 15% surcharge when occupancy is above 80%', () => {
        const result = rule.apply(100, 0.9);
        expect(result).toBeCloseTo(115);
    });

    it('applies 15% surcharge at exactly 81% occupancy (boundary)', () => {
        const result = rule.apply(100, 0.81);
        expect(result).toBeCloseTo(115);
    });

    it('applies 10% discount when occupancy is below 30%', () => {
        const result = rule.apply(100, 0.2);
        expect(result).toBeCloseTo(90);
    });

    it('applies 10% discount at exactly 29% occupancy (boundary)', () => {
        const result = rule.apply(100, 0.29);
        expect(result).toBeCloseTo(90);
    });

    it('applies no adjustment at mid-range occupancy (50%)', () => {
        const result = rule.apply(100, 0.5);
        expect(result).toBe(100);
    });

    it('applies no adjustment at exactly 30% (lower boundary, not below)', () => {
        const result = rule.apply(100, 0.3);
        expect(result).toBe(100);
    });

    it('applies no adjustment at exactly 80% (upper boundary, not above)', () => {
        const result = rule.apply(100, 0.8);
        expect(result).toBe(100);
    });
});