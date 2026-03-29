import {SeasonalPricingRule} from "../../../../src/pricing/domain/rules/seasonal-pricing.rule";


describe('SeasonalPricingRule', () => {
    let rule: SeasonalPricingRule;

    beforeEach(() => {
        rule = new SeasonalPricingRule();
    });

    it('applies 20% surcharge in peak summer (July)', () => {
        const result = rule.apply(100, new Date('2026-07-15'));
        expect(result).toBeCloseTo(120);
    });

    it('applies 20% surcharge at start of peak season (June)', () => {
        const result = rule.apply(100, new Date('2026-06-01'));
        expect(result).toBeCloseTo(120);
    });

    it('applies 20% surcharge at end of peak season (August)', () => {
        const result = rule.apply(100, new Date('2026-08-31'));
        expect(result).toBeCloseTo(120);
    });

    it('applies 20% discount in low season (January)', () => {
        const result = rule.apply(100, new Date('2026-01-10'));
        expect(result).toBeCloseTo(80);
    });

    it('applies 20% discount in low season (February)', () => {
        const result = rule.apply(100, new Date('2026-02-28'));
        expect(result).toBeCloseTo(80);
    });

    it('applies no adjustment in shoulder season (April)', () => {
        const result = rule.apply(100, new Date('2026-04-15'));
        expect(result).toBe(100);
    });

    it('applies no adjustment in shoulder season (October)', () => {
        const result = rule.apply(100, new Date('2026-10-01'));
        expect(result).toBe(100);
    });
});