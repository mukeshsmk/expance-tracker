import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { routeAnimations, getRouteAnimationKey } from '../../core/animations/route-animations';

@Component({
  selector: 'ce-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  animations: [routeAnimations],
})
export class MainLayoutComponent {
  mobileNavOpen = signal(false);

  constructor(private contexts: ChildrenOutletContexts) {}

  toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
  }

  getRouteAnimationData(): string {
    return getRouteAnimationKey(this.contexts);
  }
}
