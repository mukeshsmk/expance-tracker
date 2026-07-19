import { ChildrenOutletContexts } from '@angular/router';
import { animate, query, style, transition, trigger } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('220ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ],
      { optional: true }
    ),
  ]),
]);

export function getRouteAnimationKey(contexts: ChildrenOutletContexts): string {
  return contexts.getContext('primary')?.route?.snapshot?.url.join('/') ?? '';
}
