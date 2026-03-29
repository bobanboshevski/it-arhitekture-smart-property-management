import {DemandPricingRule} from "../../../../src/pricing/domain/rules/demand-pricing.rule";


describe('DemandPricingRule', () => {
    let rule: DemandPricingRule;

    beforeEach(() => {
        rule = new DemandPricingRule();
    });

    it('applies 10% surcharge when demand score is above 0.7', () => {
        const result = rule.apply(100, 0.9);
        expect(result).toBeCloseTo(110);
    });

    it('applies 5% discount when demand score is below 0.3', () => {
        const result = rule.apply(100, 0.1);
        expect(result).toBeCloseTo(95);
    });

    it('applies no adjustment at mid-range demand (0.5)', () => {
        const result = rule.apply(100, 0.5);
        expect(result).toBe(100);
    });

    it('applies no adjustment at exactly 0.3 (boundary)', () => {
        const result = rule.apply(100, 0.3);
        expect(result).toBe(100);
    });

    it('applies no adjustment at exactly 0.7 (boundary)', () => {
        const result = rule.apply(100, 0.7);
        expect(result).toBe(100);
    });
});