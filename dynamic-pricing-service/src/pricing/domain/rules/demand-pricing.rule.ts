export class DemandPricingRule {
    apply(price: number, demandScore: number): number {

        if (demandScore > 0.7) {
            return price * 1.1;
        }
        if (demandScore < 0.3) {
            return price * 0.95;
        }

        return price;
    }
}