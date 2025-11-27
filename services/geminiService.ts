import { GoogleGenAI } from "@google/genai";
import { GreenhouseBlock } from "../types";

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getAgronomistAdvice = async (
  block: GreenhouseBlock
): Promise<string> => {
  if (!ai) {
    return "API ключ не настроен. Пожалуйста, добавьте API_KEY для получения советов ИИ.";
  }

  const { sensors, config, name } = block;

  const prompt = `
    Ты опытный агроном. Ты анализируешь данные из конкретного блока теплицы: "${name}".
    Проанализируй текущие данные и дай краткий совет оператору (максимум 3 предложения).
    
    Текущие показатели:
    - Температура: ${sensors.temperature.toFixed(1)}°C
    - Влажность: ${sensors.humidity.toFixed(1)}%
    - Влажность почвы: ${sensors.soilMoisture.toFixed(1)}%
    - CO2: ${sensors.co2Level} ppm
    - Освещенность: ${sensors.lightLevel} lux
    
    Настройки автоматики для этого блока:
    - Целевая температура: ${config.targetTempDay}°C
    - Порог открытия форточек: ${config.ventOpenThreshold}°C
    
    Если все в норме, просто скажи "Климат в блоке оптимальный". Учитывай, что в разных блоках могут быть разные культуры, но сейчас анализируй только по числам.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Не удалось получить совет.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ошибка связи с сервисом ИИ.";
  }
};
