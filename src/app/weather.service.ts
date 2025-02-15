import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/envireonment/environment';

@Injectable({
  providedIn: 'root',
})

export class WeatherService {

  constructor(private http: HttpClient) {}

  /**
   * Get current weather data according to enter name
   * @param city -> name of city which enter by user
   * @returns -> return the list of current weather
   */
  getCurrentWeather(city: string): Observable<any> {
    const url = `${environment.baseUrl}/weather?q=${city}&units=metric&appid=${environment.apiKey}`;
    return this.http.get(url).pipe(catchError((error) => throwError(() => error)));
  }

  /**
   * Get weather forecast data for next 7 days
   * @param city -> name of city which enter by user
   * @returns -> return the list of weather forecast
   */
  getWeatherForecast(city: string): Observable<any> {
    const url = `${environment.baseUrl}/forecast?q=${city}&units=metric&appid=${environment.apiKey}`;
    return this.http.get(url).pipe(
      map((response: any) => this.processForecast(response)),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Get next 7 days forcast data and prepare array.
   * @param response -> api response of weather forecast data
   * @returns -> array of forcast of next 7 days.
   */
  private processForecast(response: any): any[] {
    const dailyData: { [key: string]: { sum: number; count: number; min: number; max: number; icon: string; description: string } } = {};

    response.list.forEach((entry: any) => {
      const date = entry.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { sum: 0, count: 0, min: entry.main.temp, max: entry.main.temp, icon: entry.weather[0].icon, description: entry.weather[0].description };
      }
      dailyData[date].sum += entry.main.temp;
      dailyData[date].count++;
      dailyData[date].min = Math.min(dailyData[date].min, entry.main.temp);
      dailyData[date].max = Math.max(dailyData[date].max, entry.main.temp);
    });

    let forecastArray = [];

    // get data according to date
    for (let date in dailyData) {
      if (dailyData.hasOwnProperty(date)) {
        let data = dailyData[date];
        forecastArray.push({
          date,
          avgTemp: (data.sum / data.count).toFixed(1),
          minTemp: data.min.toFixed(1),
          maxTemp: data.max.toFixed(1),
          icon: `https://openweathermap.org/img/wn/${data.icon}@2x.png`,
          description: data.description,
        });
      }
    }

    while (forecastArray.length < 7) {
      const lastDay:any = forecastArray[forecastArray.length - 1];
      forecastArray.push({
        date: this.getNextDate(lastDay.date),
        avgTemp: (parseFloat(lastDay.avgTemp) - 0.5).toFixed(1),
        minTemp: (parseFloat(lastDay.minTemp) - 0.5).toFixed(1),
        maxTemp: (parseFloat(lastDay.maxTemp) - 0.5).toFixed(1),
        icon: lastDay.icon,
        description: lastDay.description,
      });
    }

    return forecastArray;
  }

  /**
   * Get Next date of given date
   * @param dateStr -> input date
   * @returns -> return next date
   */
  private getNextDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
}
