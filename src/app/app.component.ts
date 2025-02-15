import { Component } from '@angular/core';
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  name: string = 'Jakarta';
  currentWeather: any;
  forecast: any[] = [];
  isLoading: boolean;
  isError: boolean;

  constructor(private weatherService: WeatherService) {
    this.isLoading = false;
    this.isError = false;
  }

  ngOnInit(): void {
    this.getWeather();
  }

  /**
   * Get Weather of search name
   */
  getWeather() {
    this.isLoading = true;
    this.isError = false;

    this.weatherService.getCurrentWeather(this.name).subscribe(
      (data) => {
        this.currentWeather = {
          name: data.name,
          temp: ((data.main.temp_min+data.main.temp_max)/2).toFixed(2),
        };
        this.getForecast();
      },
      () => {
        this.isLoading = false;
        this.isError = true;
      }
    );
  }

  /**
   * Get Forcaset details
   */
  getForecast() {
    this.weatherService.getWeatherForecast(this.name).subscribe(
      (data) => {
        this.forecast = data.slice(0, 7); // Get next 7 days
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
        this.isError = true;
      }
    );
  }

  /**
   * Get Formatted date in desired formate.
   * @param dateStr -> date value which need to convert
   * @returns -> convert desired date formate
   */
  getFormattedDate(dateStr: string): string {
    const today = new Date();
    const date = new Date(dateStr);

    // Remove time part to ensure proper date comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      // formate: "16 Feb 2025"
    }
  }
}
