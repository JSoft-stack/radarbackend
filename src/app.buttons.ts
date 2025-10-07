import { Markup } from "telegraf";

export function actionButtons(){
return  Markup.keyboard([
    [Markup.button.game('📋 Menu', true)],
])
}