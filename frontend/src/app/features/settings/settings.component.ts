import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'ce-settings',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  isDark = signal(false);

  ngOnInit(): void {
    this.isDark.set(document.documentElement.getAttribute('data-theme') === 'dark');
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('ce_theme', next ? 'dark' : 'light');
  }
}
