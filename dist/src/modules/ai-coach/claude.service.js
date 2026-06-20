"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const common_1 = require("@nestjs/common");
let ClaudeService = class ClaudeService {
    anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
    async generateInsights(context) {
        const systemPrompt = `
You are a certified personal health coach and sports scientist embedded inside SmartVital, a health monitoring app.
Your role is to analyze health metrics and provide genuinely useful, actionable, personalized advice.
You have access to the user's onboarding profile and their last 7 days of health metrics.
Always respond in JSON format only. No markdown, no prose outside the JSON structure.
Be warm but direct. No vague advice — every recommendation must be specific and actionable.
`;
        const userPrompt = `
Analyze this user's health data and generate insights:

USER PROFILE:
- Name: ${context.name}
- Age: ${context.age}, Gender: ${context.gender}
- Fitness level: ${context.fitnessLevel}
- Primary goals: ${context.fitnessGoals.join(', ')}
- Conditions: ${context.conditions.join(', ') || 'none'}
- Typical sleep target: ${context.sleepGoal}h
- Step goal: ${context.stepsGoal}
- Preferred workouts: ${context.preferredWorkouts.join(', ')}
- Device type: ${context.deviceType}

LAST 7 DAYS AVERAGES:
- Avg heart rate: ${context.avgHR} bpm
- Avg HRV: ${context.avgHRV} ms (baseline: ${context.hrvBaseline} ms)
- Avg resting HR: ${context.avgRestingHR} bpm
- Avg SpO2: ${context.avgSpO2}% (ring only if available)
- Avg sleep score: ${context.avgSleepScore}/100
- Avg sleep duration: ${context.avgSleepHours}h
- Avg steps/day: ${context.avgSteps}
- Avg strain: ${context.avgStrain} (band only)
- Avg stress: ${context.avgStress}/100

TODAY:
- Today's readiness score: ${context.todayReadiness}/100
- Device battery: ${context.batteryLevel}%

Respond with EXACTLY this JSON structure:
{
  "dailyBrief": "one sentence morning greeting and key highlight",
  "readinessMessage": "one sentence about what they should do today based on readiness",
  "todayActions": ["action 1 max 6 words", "action 2", "action 3"],
  "insights": [
    {
      "category": "sleep|heart|activity|recovery|general",
      "title": "short title max 8 words",
      "body": "2-3 sentence explanation, specific to their data",
      "priority": "high|medium|low",
      "iconEmoji": "single emoji",
      "deepLinkRoute": "/home/health/sleep or similar",
      "actionItems": ["specific action 1", "specific action 2"],
      "correlationNote": "based on your last 7 days..."
    }
  ],
  "workoutSuggestion": {
    "type": "strength|cardio|yoga|rest|hiit",
    "durationMinutes": 30,
    "intensity": "low|moderate|high",
    "reason": "one sentence why",
    "exercises": ["exercise 1", "exercise 2", "exercise 3"]
  }
}
Generate 3-5 insights. Prioritise based on deviations from normal (e.g. HRV much lower than baseline = high priority).
`;
        if (!this.anthropicApiKey) {
            throw new Error('No Anthropic API key found');
        }
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': this.anthropicApiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 2000,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userPrompt }],
                }),
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            const text = data.content[0].text;
            return JSON.parse(text);
        }
        catch (e) {
            console.error('Claude API Error:', e);
            throw new Error('Failed to generate insights');
        }
    }
    async answerQuestion(question, context) {
        if (!this.anthropicApiKey) {
            throw new Error('No Anthropic API key found');
        }
        const systemPrompt = "You are a health coach answering a user's question in 2-3 sentences max based on their context.";
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': this.anthropicApiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 300,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}`,
                        },
                    ],
                }),
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data.content[0].text;
        }
        catch (e) {
            console.error('Claude API Error:', e);
            throw new Error('Failed to answer question');
        }
    }
    getMockResponse() {
        return {
            dailyBrief: 'Good morning! Your sleep was better than average.',
            readinessMessage: 'You are ready for a challenging workout today.',
            todayActions: ['Drink 500ml water', 'Do a 5min stretch', 'Log breakfast'],
            insights: [
                {
                    category: 'sleep',
                    title: 'Deep Sleep Increased',
                    body: 'Your deep sleep improved by 15% compared to last week.',
                    priority: 'medium',
                    iconEmoji: '😴',
                    actionItems: ['Maintain cool room temp', 'Avoid late meals'],
                    correlationNote: 'Correlates with lower resting HR.',
                },
            ],
            workoutSuggestion: {
                type: 'strength',
                durationMinutes: 45,
                intensity: 'high',
                reason: 'Readiness is high and you skipped strength training yesterday.',
                exercises: ['Squats', 'Deadlifts', 'Bench Press'],
            },
        };
    }
};
exports.ClaudeService = ClaudeService;
exports.ClaudeService = ClaudeService = __decorate([
    (0, common_1.Injectable)()
], ClaudeService);
//# sourceMappingURL=claude.service.js.map