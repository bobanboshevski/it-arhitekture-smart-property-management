import {Injectable} from "@nestjs/common";
import {SeasonalPricingRule} from "../rules/seasonal-pricing.rule";
import {OccupancyPricingRule} from "../rules/occupancy-pricing.rule";
import {DemandPricingRule} from "../rules/demand-pricing.rule";


@Injectable()
export class PricingCalculatorService {
    private seasonalRule = new SeasonalPricingRule();
    private occupancyRule = new OccupancyPricingRule();
    private demandRule = new DemandPricingRule();

    calculate(
        basePrice: number,
        date: Date,
        occupancyRate: number,
        demandScore: number,
    ): number {
        let price = basePrice;

        price = this.seasonalRule.apply(price, date);
        price = this.occupancyRule.apply(price, occupancyRate);
        price = this.demandRule.apply(price, demandScore);

        return price //.toFixed(2); // todo: what + means
    }
}