import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import Stripe from 'stripe';
import { settings } from '../../../settings';

const stripe = new Stripe(settings.STRIPE_TOKEN, {
  apiVersion: '2022-11-15',
});

@Controller('/integration/stripe')
export class StripeController {
  // constructor() {}

  @Post('webhook')
  async stripeHook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        settings.SIGNING_SECRET,
      );
      if (event.type === 'checkout.session.completed') {
        const season = event.data.object as Stripe.Checkout.Session;
        //Здесь логика подключения к useCase
      }
      console.log('Good');
    } catch (err) {
      throw new BadRequestException(`Webhook errors: ${err.message}`);
    }
  }

  @Get('success')
  success() {
    return 'Товар успешно преобретен!!!';
  }

  @Get('error')
  error() {
    return 'Произошла ошибка';
  }

  @Get('buy')
  async buy(@Query('productId') productId: any) {
    return stripe.checkout.sessions.create({
      success_url: 'http://localhost:3000/integration/stripe/success',
      cancel_url: 'http://localhost:3000/integration/stripe/error',
      line_items: [
        {
          price_data: {
            product_data: { name: `membership ${productId}` },
            currency: 'USD',
            unit_amount: 100 * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: '11',
    });
  }
}
