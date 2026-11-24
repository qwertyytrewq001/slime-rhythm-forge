/**
 * A short story beat after every battle win, told by Glim. The big beats (levels 1, 5, 10, 14, 15, 20, 25, 30, 35,
 * 40, 45, 49, 50) live in LoreTutorial; these fill in the rest so every level moves the story along.
 * Regions follow the world map: 1-10 Verdant Lowlands, 11-20 Whispering Wood & Golden Plains,
 * 21-30 Ironcliff Mines & Murkmire Swamp, 31-40 Frostpeak Skyway, 41-50 The Forgotten Castle.
 */
export interface StoryBeat { expression: string; text: string }

const beat = (expression: string, ...lines: string[]): StoryBeat[] => lines.map(text => ({ expression, text }));

export const BATTLE_STORY: Record<number, StoryBeat[]> = {
  2: beat('relieved', "Two for two. The Lowlands slimes are getting quiet, which is odd.", "Usually they won't shut up after a fight."),
  3: beat('serious', "That one was scared, not angry. Did you see how it kept backing off?", "Something is pushing these slimes out of their homes."),
  4: beat('relieved', "Nice timing on those attacks. A Forger who actually listens to the rhythm, I could get used to that.", "Take the food they dropped. It's yours."),
  6: beat('serious', "The grass is thinner here. The Goo under the Lowlands is running low.", "That's the third pond in a row that's half empty."),
  7: beat('relieved', "A slime followed us out of the pond and just sat there. I think it wants to be bred.", "Write that down for later."),
  8: beat('serious', "Fresh wheel ruts leading off the road. Somebody is hauling Goo out of here in barrels.", "That's no accident."),
  9: beat('urgent', "The road ahead goes into the Crystal Ridge.", "Whatever drained the Lowlands, I think it started up there."),
  11: beat('relieved', "Whispering Wood. The trees here talk, you just have to be patient.", "They're telling me a stranger went through, carrying a lot of empty barrels."),
  12: beat('serious', "Even the plant slimes are jumpy. They think we work for him.", "Let them swing first. They'll figure it out."),
  13: beat('urgent', "The tracks split here. One set goes to the plains, one goes underground.", "We take the plains. The underground set is too deep to follow just yet."),
  16: beat('relieved', "Golden Plains. Look at that sky, you could bottle it.", "The slimes here are shy, not mean. Win them over and they'll follow you home."),
  17: beat('serious', "The Golden Plains used to glow at night. Now it's just grass.", "I want that glow back."),
  18: beat('grim', "Look at the soil. Burned, not by fire. Something sucked the life straight out of it.", "That's how his machines work."),
  19: beat('urgent', "One more fight and we're out of the Plains.", "After this it's mines, and mines are where I start to worry."),
  21: beat('serious', "Ironcliff Mines. Cold, loud, and nobody here likes visitors.", "The metal slimes especially. Don't take it personally."),
  22: beat('quiet', "Hear that humming in the walls? That's Goo being pulled through pipes.", "Somebody built all this under our feet."),
  23: beat('grim', "These slimes were guarding a pipe. They weren't angry at us, they were angry at whoever put it there.", "Be gentle with them."),
  24: beat('serious', "I followed the pipe. It leads to the Murkmire Swamp.", "Which is exactly where I said he'd go."),
  26: beat('urgent', "The swamp changes the closer we get. The water's too still.", "Shadow slimes are old and patient. If one is fighting, it's got a reason."),
  27: beat('quiet', "Did you notice that one hesitated before it attacked?", "It was testing whether we were a threat. We passed, barely."),
  28: beat('serious', "The swamp slimes keep pointing the same direction. East.", "They want us to see something."),
  29: beat('grim', "Burned-out pumps, all in a line. He's been here a long time.", "And he's not even trying to hide it."),
  31: beat('relieved', "Frostpeak Skyway. I'll be honest, I hate cold.", "But look at the view. You can see the whole valley from here."),
  32: beat('serious', "Ice slimes don't forget. These ones remember a Forger from long ago, and they don't like it.", "Prove that you're different."),
  33: beat('urgent', "Wind's picking up. The lightning slimes get restless in a storm.", "Watch your timing."),
  34: beat('quiet', "I keep thinking about the first Forger who went bad.", "He thought he was fixing things too."),
  36: beat('serious', "Higher up, the air is clear and the slimes are stronger.", "Feed your team before we climb. It matters up here."),
  37: beat('grim', "Another pump station, another empty pool.", "He's draining the whole mountain."),
  38: beat('urgent', "There's smoke over the next ridge. Not a cloud. A forge.", "He's building something big."),
  39: beat('serious', "Last climb before the castle road.", "Anyone you want to say hello to, now's the time."),
  41: beat('quiet', "The Forgotten Castle. I haven't been inside in four hundred years.", "It's smaller than I remember."),
  42: beat('serious', "The shadow slimes in these halls are still guarding the castle. Nobody told them the war was over.", "Be kind to them."),
  43: beat('grim', "These hallways used to be full of Forgers arguing about breeding charts.", "Now it's just us and the echo."),
  44: beat('urgent', "Listen. Machinery, deeper in the castle. He's close.", "Don't get cocky."),
  46: beat('scared', "I don't like how quiet it got.", "Voss would have sent more by now. Unless he's saving them."),
  47: beat('serious', "Every slime you bred is fighting for you. Look at them.", "That's not something his machines can copy."),
  48: beat('determined', "One more door and the gate. Whatever's behind it, we do it together.", "Eat something. Rest your team."),
};

/** A quick Glim line on the result screen right after a fight, picked at random so repeat battles don't feel canned. */
export const RESULT_LINES = {
  perfect: ["Every beat landed. Okay, I'm impressed.", "That timing was clean. The slimes felt it too.", "You're not just tapping, you're playing them like a drum."],
  flawless: ["Nobody went down. That's how a Forger does it.", "Whole team standing. They trust you, you know.", "Not a scratch on the team. Show-off."],
  win: ["Good fight. Let the team rest, they earned it.", "Another one down. The road gets a little safer.", "Feed them well. A happy slime hits harder.", "That's the spirit. Slimes fight for people who care."],
  lose: ["That's okay. Even Voss lost fights once.", "Don't sulk. Level them up, breed something new, and try again.", "Rest first. A different team mix might do the trick.", "We lost a round, not the war. Check their elements and come back."],
};
