angular.module('TypeOrDie').controller(
'gameTutorialCtrl',
function($scope, $modal, $location) {

	// canvas context
	var ctxBackground;
	var ctxSpecial;
	var ctxInfoBox;
	var ctxParticles;
	var ctxUnits;
	var ctxEnemies;
	var ctxImage;
	var ctxTutorial;
	var auxCtx;

	// canvas vars
	var width = 1200;
	var height = 600;
	var height2 = 100;
	var widthTutorial = 1400;
	var heightTutorial = 900;
	var shadowBlur = 20;
	var explosionParticles = 45;
	var mobile = false;

	// game vars
	var input;
	var buttonNext;
	var interval;
	var oponentImg = new Image();
	var userImg = new Image();
	oponentImg.src = 'img/default.png';
	oponentImg.onload = function() {
		userImg.src = 'img/default.png';
		userImg.onload = function() {
			drawImage();
		};
	};
	var units = [];
	var enemies = [];
	var special = null;
	var specialTutorial = false;
	var enemiesColor = '#FF0000';
	var color = '#00FF00';
	var specialColor = '#FFFF00';
	var textColor = [ '#0080FF', '#00BFFF', '#2E64FE', '#0040FF' ];
	var particles = [];
	var wordParticles = [];
	var specialParticles = [];
	var specialTarget = {
	    x : -100,
	    y : 300
	};
	var player = {};
	var enemy = {};
	player.life = 100;
	player.score = 0;
	enemy.life = 100;
	enemy.score = 0;
	var myModal;
	var gameRuning = true;
	var timeLeft = 100;
	var nextWord = 7;
	var word = 'hola';
	var tutorialStep = 1;
	var tutorialPaused = false;

	var unitsWords = [ 'abaft', 'adobe', 'affix', 'after', 'alarm', 'album', 'alkyd', 'aloft', 'along', 'amide', 'amour', 'ample', 'apace', 'aphid', 'apply', 'apsis', 'argon', 'array', 'atoll', 'attic', 'audio', 'axial', 'balsa', 'bases', 'basin',
	        'baste', 'bayou', 'beady', 'being', 'beryl', 'bidet', 'bigot', 'bilge', 'bitch', 'blank', 'blend', 'blitz', 'board', 'booth', 'boozy', 'bract', 'brave', 'bride', 'broil', 'brood', 'brows', 'bruit', 'build', 'bulgy', 'calla', 'calls',
	        'capon', 'cased', 'casts', 'cavil', 'chasm', 'cheek', 'chert', 'child', 'chine', 'choir', 'chomp', 'chose', 'clang', 'clown', 'clunk', 'comae', 'comfy', 'copay', 'corps', 'crawl', 'cream', 'credo', 'creed', 'crept', 'criss', 'crowd',
	        'cubic', 'cubit', 'culpa', 'cumin', 'curly', 'curve', 'cushy', 'delve', 'detox', 'dhoti', 'digit', 'dodgy', 'doing', 'dowel', 'dozer', 'drape', 'draws', 'duchy', 'dunce', 'duxes', 'edict', 'educe', 'egret', 'elder', 'elude', 'elver',
	        'embed', 'empty', 'equiv', 'erode', 'ether', 'evict', 'exact', 'expel', 'fable', 'facto', 'fairy', 'finny', 'fiord', 'fishy', 'flack', 'flaky', 'flame', 'flush', 'foamy', 'focus', 'folly', 'forum', 'frisk', 'frown', 'fuses', 'fuzzy',
	        'galen', 'gaper', 'gavel', 'genie', 'giant', 'giber', 'giddy', 'glean', 'gnarl', 'gouty', 'grade', 'grant', 'graze', 'greet', 'grimy', 'grind', 'groat', 'groin', 'groom', 'guess', 'guppy', 'gusts', 'haiku', 'hardy', 'havoc', 'heath',
	        'helix', 'hitch', 'hoard', 'hoist', 'honey', 'hover', 'huffy', 'human', 'hussy', 'imped', 'ingot', 'inlay', 'inure', 'jaggy', 'jetty', 'jihad', 'joins', 'juicy', 'julep', 'junta', 'kappa', 'kicky', 'kills', 'kinda', 'knack', 'kooky',
	        'label', 'lauds', 'lefty', 'leper', 'level', 'linen', 'lines', 'litre', 'loads', 'locks', 'logia', 'login', 'lotto', 'louse', 'lupus', 'macro', 'major', 'mealy', 'media', 'melts', 'metre', 'milch', 'minor', 'misty', 'mogul', 'molal',
	        'mooch', 'moped', 'motel', 'mound', 'mufti', 'mushy', 'myrrh', 'nabob', 'naked', 'navvy', 'needy', 'newsy', 'niche', 'nohow', 'noire', 'north', 'novel', 'nudge', 'opera', 'ought', 'oxide', 'paced', 'paint', 'paled', 'paler', 'palsy',
	        'panic', 'panky', 'pants', 'parka', 'parse', 'patch', 'patio', 'payee', 'peaty', 'pewit', 'pinna', 'pipit', 'plant', 'plead', 'podgy', 'poppy', 'porch', 'posed', 'poser', 'posit', 'prank', 'prime', 'pupil', 'quack', 'quash', 'quoit',
	        'quota', 'quoth', 'rajah', 'renal', 'reply', 'reset', 'revel', 'rifle', 'ripen', 'ritzy', 'riyal', 'rough', 'rowdy', 'rumen', 'rummy', 'salvo', 'scald', 'scans', 'scion', 'scour', 'scowl', 'sepal', 'serve', 'shaky', 'shame', 'shark',
	        'sheik', 'shove', 'shrug', 'shush', 'sided', 'since', 'siren', 'skill', 'skulk', 'smack', 'small', 'smash', 'snake', 'snare', 'snarl', 'snoot', 'sorry', 'sorts', 'sound', 'split', 'spoil', 'spoor', 'spurn', 'sputa', 'stand', 'start',
	        'steam', 'steed', 'steer', 'stern', 'stick', 'stile', 'still', 'strum', 'sulky', 'supra', 'sword', 'swung', 'taiga', 'taker', 'tangy', 'tawny', 'tease', 'teddy', 'tempt', 'tenet', 'thane', 'tilde', 'tithe', 'tonal', 'torus', 'track',
	        'train', 'trash', 'tribe', 'tripe', 'troth', 'trump', 'truss', 'tunic', 'tweet', 'ultra', 'uncut', 'unfit', 'upped', 'upper', 'uvula', 'vaunt', 'velum', 'vests', 'villa', 'visit', 'vista', 'vixen', 'vomit', 'vouch', 'vulva', 'wagon',
	        'waste', 'whelk', 'whims', 'white', 'whore', 'whorl', 'witch', 'wizen', 'woken', 'woody', 'woozy', 'worst', 'yokel', 'zebra', 'abbot', 'abhor', 'adorn', 'agile', 'aglow', 'agree', 'aisle', 'alkyl', 'aloha', 'altar', 'angst', 'annoy',
	        'aorta', 'apart', 'apish', 'aroma', 'arras', 'asked', 'assay', 'badge', 'baggy', 'balun', 'bater', 'beard', 'bedim', 'beech', 'befit', 'bench', 'besot', 'bland', 'bleed', 'bliss', 'bluer', 'bongo', 'bonny', 'bosun', 'brain', 'break',
	        'brink', 'brush', 'bully', 'bursa', 'busty', 'cabal', 'caeca', 'cameo', 'cargo', 'carny', 'catty', 'cause', 'caver', 'chalk', 'chaos', 'chart', 'cheap', 'chill', 'churn', 'chyme', 'circa', 'cissy', 'civil', 'click', 'clime', 'coded',
	        'cokey', 'comic', 'coral', 'couch', 'crane', 'crazy', 'creel', 'cress', 'curls', 'curry', 'cutup', 'death', 'decry', 'deeds', 'deign', 'demur', 'devil', 'dicta', 'dildo', 'dinky', 'ditch', 'divvy', 'dotty', 'douse', 'dwell', 'eight',
	        'elegy', 'elves', 'email', 'enact', 'ennui', 'envoy', 'evoke', 'excel', 'faery', 'faint', 'fiche', 'filmy', 'finer', 'flair', 'fleet', 'flirt', 'float', 'flock', 'fluid', 'fluke', 'flung', 'foray', 'fouls', 'frail', 'fries', 'froid',
	        'fudge', 'gabby', 'genus', 'getup', 'girth', 'glass', 'gluon', 'glyph', 'gorse', 'gouge', 'grace', 'graph', 'grasp', 'gravy', 'grout', 'guard', 'hallo', 'halve', 'handy', 'hasty', 'hazel', 'hdqrs', 'heard', 'henna', 'horde', 'horse',
	        'humid', 'humus', 'idyll', 'impel', 'infer', 'infra', 'intro', 'ivory', 'jenny', 'jewel', 'jitsu', 'joist', 'jowly', 'junco', 'kaput', 'ketch', 'kitty', 'knock', 'kraal', 'krill', 'krone', 'laity', 'lance', 'lapel', 'larva', 'latch',
	        'laxes', 'layup', 'leads', 'libel', 'links', 'loath', 'lucid', 'lunge', 'lusty', 'lynch', 'macer', 'marsh', 'mezzo', 'micro', 'milky', 'minds', 'mirth', 'mists', 'momma', 'moron', 'mould', 'mouth', 'mumbo', 'munch', 'murky', 'nadir',
	        'nitre', 'noway', 'ocean', 'octet', 'olden', 'olive', 'omega', 'outdo', 'owlet', 'paean', 'pales', 'paste', 'pasts', 'peppy', 'perch', 'pewee', 'pinky', 'pitch', 'pithy', 'piton', 'pixie', 'place', 'plasm', 'pleas', 'plied', 'plunk',
	        'polka', 'poses', 'potty', 'pride', 'primp', 'print', 'prise', 'prize', 'probe', 'prune', 'psych', 'purer', 'purge', 'pygmy', 'quaff', 'quake', 'qualm', 'quasi', 'quest', 'quoin', 'rabid', 'radar', 'raise', 'ratio', 'recto', 'reedy',
	        'rewed', 'riper', 'rocky', 'roomy', 'route', 'rowel', 'ruddy', 'rural', 'sabra', 'sally', 'salve', 'sandy', 'sauna', 'scale', 'scold', 'scone', 'scorn', 'sedan', 'segue', 'senna', 'septa', 'shade', 'shear', 'sheet', 'shelf', 'shirt',
	        'sidle', 'skein', 'skiff', 'slack', 'slain', 'slash', 'sleep', 'slink', 'sloth', 'slump', 'smock', 'snafu', 'snail', 'snaps', 'snore', 'snowy', 'south', 'spark', 'spate', 'spent', 'spice', 'spilt', 'spool', 'squid', 'stage', 'steel',
	        'stein', 'stiff', 'stray', 'styli', 'sugar', 'swank', 'swarm', 'swoon', 'swore', 'table', 'takes', 'taper', 'tarry', 'telex', 'terns', 'theft', 'their', 'there', 'think', 'thorn', 'thumb', 'thump', 'tinny', 'today', 'tonne', 'topic',
	        'tough', 'tower', 'troll', 'truce', 'tulle', 'tummy', 'turvy', 'tutor', 'twang', 'twine', 'usurp', 'utile', 'valet', 'vault', 'villi', 'vinyl', 'vitae', 'vital', 'waver', 'wench', 'wheat', 'widen', 'wring', 'yeast', 'youth', 'abide',
	        'abyss', 'ached', 'acorn', 'adieu', 'admit', 'alack', 'allot', 'amaze', 'amber', 'amity', 'anger', 'annal', 'anode', 'arrow', 'askew', 'aspic', 'assen', 'attar', 'avant', 'banal', 'barge', 'basis', 'beach', 'beaux', 'biddy', 'bison',
	        'biter', 'bless', 'blond', 'boast', 'bonus', 'bound', 'bower', 'braze', 'bread', 'broom', 'bulky', 'cairn', 'canny', 'canst', 'carol', 'carve', 'cease', 'chess', 'chief', 'chuck', 'chute', 'cider', 'cinch', 'claim', 'clave', 'cleat',
	        'cliff', 'cocci', 'coper', 'crash', 'crass', 'creep', 'crone', 'crude', 'crump', 'cruse', 'curio', 'curse', 'cynic', 'daddy', 'dance', 'davit', 'deist', 'dewar', 'dials', 'diary', 'dizzy', 'doily', 'domes', 'downy', 'drain', 'drink',
	        'drool', 'drove', 'durum', 'dusty', 'easel', 'egger', 'elect', 'elite', 'emery', 'equip', 'extol', 'farad', 'farce', 'fatwa', 'feeds', 'feign', 'femur', 'fibre', 'fiery', 'filth', 'flank', 'flaps', 'flora', 'flout', 'flyer', 'foist',
	        'folio', 'folks', 'forgo', 'fount', 'foxed', 'frost', 'fruit', 'gassy', 'glare', 'gloss', 'gourd', 'grand', 'greed', 'grill', 'guest', 'gunny', 'gushy', 'gutsy', 'gutta', 'hands', 'happy', 'harem', 'hayer', 'heave', 'heigh', 'henry',
	        'hilly', 'hinge', 'hoary', 'honer', 'hooey', 'hotel', 'hound', 'ictus', 'imply', 'infix', 'inter', 'intra', 'islet', 'jaded', 'jerky', 'jerry', 'kazoo', 'kudos', 'ladle', 'lardy', 'large', 'latex', 'latte', 'leapt', 'lemme', 'lemur',
	        'licit', 'llama', 'logic', 'lorry', 'lowly', 'lucky', 'luger', 'mains', 'mango', 'mangy', 'march', 'matzo', 'mazer', 'medic', 'might', 'miler', 'mined', 'minke', 'mocha', 'modal', 'moose', 'morph', 'motes', 'mumps', 'muted', 'nacho',
	        'nacre', 'natch', 'nimbi', 'nubby', 'nylon', 'octal', 'opine', 'other', 'owner', 'oxbow', 'paddy', 'party', 'paved', 'paver', 'pecan', 'peers', 'peril', 'petal', 'petty', 'phony', 'picot', 'pilot', 'pique', 'piste', 'plies', 'poach',
	        'polar', 'prate', 'press', 'price', 'prism', 'privy', 'promo', 'prove', 'pukka', 'quail', 'quirk', 'quite', 'radii', 'rapid', 'raven', 'rayon', 'ready', 'relic', 'resit', 'resow', 'rivet', 'rosin', 'rouse', 'runty', 'sahib', 'sappy',
	        'scalp', 'scare', 'scoot', 'scrim', 'scrip', 'scuba', 'sheen', 'shine', 'shout', 'shown', 'shred', 'shyly', 'siege', 'sight', 'silly', 'simon', 'singe', 'sinus', 'sisal', 'slake', 'slosh', 'slung', 'smirk', 'smite', 'smoke', 'snide',
	        'snood', 'soles', 'spade', 'spawn', 'spear', 'spelt', 'splay', 'spots', 'stack', 'stain', 'stale', 'stall', 'stash', 'steak', 'steep', 'stink', 'stoma', 'stone', 'stump', 'stunt', 'sunny', 'surly', 'sweat', 'swizz', 'tacit', 'taint',
	        'talus', 'teens', 'teeth', 'telly', 'tempo', 'tenth', 'testy', 'tetra', 'therm', 'thigh', 'thole', 'throe', 'tiger', 'tipsy', 'title', 'toady', 'tones', 'torch', 'towel', 'trail', 'trite', 'turfy', 'tweed', 'twill', 'umber', 'unite',
	        'urine', 'vague', 'veldt', 'venal', 'verge', 'vicar', 'voile', 'weeny', 'weigh', 'widow', 'width', 'wince', 'wispy', 'woman', 'worry', 'wound', 'wrote', 'yacht', 'yield', 'aback', 'abate', 'above', 'abuzz', 'addle', 'adman', 'afire',
	        'aleph', 'alibi', 'allay', 'aloof', 'alpha', 'alter', 'amend', 'amine', 'angry', 'annul', 'arena', 'argue', 'aside', 'atilt', 'atria', 'audit', 'augur', 'aural', 'auxin', 'avert', 'bandy', 'basal', 'baton', 'bawdy', 'beano', 'beast',
	        'berry', 'betel', 'birth', 'blear', 'bleep', 'bluff', 'blunt', 'boost', 'boron', 'botch', 'bothy', 'brace', 'bravo', 'brine', 'bronc', 'brose', 'buffs', 'bunch', 'burst', 'byers', 'cable', 'cache', 'campy', 'canoe', 'carat', 'cares',
	        'carom', 'carry', 'carte', 'caulk', 'chard', 'cheep', 'chewy', 'chino', 'chirp', 'chuff', 'chump', 'cilia', 'cited', 'clack', 'clink', 'clogs', 'clove', 'cobra', 'condo', 'conic', 'cords', 'cough', 'cozen', 'craft', 'crepe', 'crest',
	        'cross', 'croup', 'crown', 'cruet', 'cupid', 'curia', 'curvy', 'dacha', 'daisy', 'debit', 'decoy', 'deuce', 'diker', 'dirty', 'dived', 'dogma', 'dorky', 'dower', 'downs', 'dread', 'droop', 'druid', 'ducat', 'ducky', 'early', 'eider',
	        'elans', 'elide', 'elope', 'emcee', 'endue', 'enter', 'essay', 'event', 'exalt', 'exert', 'famed', 'felon', 'ferny', 'fever', 'fixer', 'fizzy', 'floor', 'fovea', 'frame', 'freak', 'freon', 'fully', 'fusty', 'futon', 'gaunt', 'gauze',
	        'geese', 'given', 'gonad', 'grief', 'growl', 'guano', 'haler', 'harsh', 'hippo', 'hippy', 'hodge', 'hogan', 'hoity', 'hokey', 'hunch', 'hurry', 'iambi', 'igloo', 'inane', 'incur', 'inert', 'inset', 'irony', 'itchy', 'jeans', 'joule',
	        'joyed', 'kebab', 'knead', 'knelt', 'knurl', 'lamed', 'later', 'leash', 'leech', 'lepta', 'lever', 'lieut', 'liken', 'linty', 'lipid', 'loony', 'lousy', 'loyal', 'lupin', 'macaw', 'magic', 'magma', 'malty', 'mambo', 'manly', 'manna',
	        'marry', 'mayor', 'medal', 'merge', 'metro', 'midst', 'modem', 'molar', 'molly', 'monad', 'moral', 'motif', 'moved', 'multi', 'mummy', 'musky', 'naiad', 'naifs', 'naval', 'nerve', 'newel', 'niece', 'noble', 'offer', 'often', 'onion',
	        'opium', 'oriel', 'ovary', 'ovate', 'ovoid', 'ovule', 'papaw', 'pared', 'parer', 'peach', 'pearl', 'penis', 'penny', 'peter', 'photo', 'piece', 'piggy', 'pince', 'pizza', 'plait', 'plane', 'plume', 'pooch', 'porky', 'ports', 'pound',
	        'prawn', 'pudgy', 'puffy', 'puppy', 'pussy', 'pyxis', 'query', 'quint', 'raspy', 'refer', 'refit', 'resin', 'rigid', 'rinse', 'risky', 'rival', 'riven', 'roach', 'royal', 'rusty', 'sacra', 'safer', 'scape', 'scarp', 'scoff', 'score',
	        'scurf', 'seeds', 'semen', 'sense', 'seven', 'shawl', 'shchi', 'sheer', 'shirr', 'shook', 'shrub', 'silky', 'sissy', 'sitar', 'sixty', 'sleek', 'slime', 'slyer', 'snaky', 'soapy', 'socio', 'soggy', 'solid', 'sonar', 'space', 'spasm',
	        'spend', 'spine', 'spout', 'sprue', 'spunk', 'squaw', 'squib', 'staff', 'staid', 'stair', 'stake', 'stare', 'steps', 'stock', 'stole', 'stoup', 'straw', 'strim', 'strip', 'stung', 'suite', 'super', 'swede', 'swing', 'taboo', 'tabor',
	        'tapir', 'taste', 'thank', 'throb', 'tilth', 'titre', 'token', 'tooth', 'total', 'tract', 'treat', 'trope', 'truth', 'twirl', 'umbel', 'unlap', 'unlit', 'unmet', 'unpin', 'urban', 'usage', 'usury', 'value', 'venue', 'versa', 'viper',
	        'visor', 'vitro', 'volte', 'vowel', 'whoop', 'whoso', 'wired', 'wirer', 'wives', 'wonky', 'worse', 'would', 'wryly', 'xenon', 'yummy', 'zloty', 'abase', 'abbey', 'adept', 'afoul', 'aitch', 'alert', 'amiss', 'annum', 'anvil', 'appal',
	        'argot', 'arise', 'asses', 'auger', 'aunty', 'avian', 'await', 'awing', 'balls', 'bands', 'banjo', 'barre', 'based', 'basic', 'basso', 'beery', 'began', 'begot', 'begum', 'bight', 'billy', 'binge', 'blare', 'blown', 'blurb', 'bosom',
	        'brand', 'brawl', 'bream', 'breed', 'broad', 'bunny', 'burgh', 'burly', 'bushy', 'cadet', 'camps', 'catch', 'cedar', 'cello', 'chest', 'china', 'chive', 'chord', 'chunk', 'clamp', 'clock', 'clung', 'cocky', 'codex', 'copra', 'copse',
	        'coven', 'crape', 'crick', 'cries', 'crime', 'croft', 'crook', 'crypt', 'cuber', 'cyder', 'dally', 'dandy', 'decal', 'demon', 'denim', 'depth', 'diode', 'dirge', 'divan', 'divot', 'doubt', 'dowry', 'drank', 'drupe', 'dryer', 'dryly',
	        'durst', 'dwarf', 'ebony', 'edify', 'eject', 'elate', 'ember', 'emote', 'enemy', 'enjoy', 'entry', 'ethos', 'evade', 'exile', 'extra', 'faith', 'femme', 'filch', 'finis', 'fixes', 'flesh', 'fling', 'fluky', 'flume', 'flute', 'flyby',
	        'focal', 'forte', 'found', 'franc', 'frock', 'fused', 'fussy', 'gaily', 'gamin', 'gelid', 'glans', 'glide', 'glint', 'globe', 'glued', 'gnome', 'goose', 'gorge', 'grass', 'gripe', 'grist', 'gruff', 'grump', 'grunt', 'guide', 'guise',
	        'gunky', 'hades', 'hadst', 'haven', 'hears', 'hedge', 'hence', 'heron', 'hicks', 'hidey', 'hight', 'hooks', 'hunky', 'ideal', 'ilium', 'image', 'inept', 'irate', 'jemmy', 'jiffy', 'joint', 'jokey', 'jumbo', 'jumpy', 'kapok', 'kinky',
	        'kraft', 'labia', 'lapse', 'lasso', 'lasts', 'layer', 'leach', 'leave', 'leery', 'legal', 'liege', 'liker', 'lilly', 'limit', 'lived', 'local', 'loris', 'lower', 'lumen', 'lurch', 'lurid', 'lymph', 'maize', 'mamba', 'maple', 'marks',
	        'meant', 'meaty', 'mercy', 'meson', 'meter', 'mimer', 'minim', 'minus', 'mixed', 'model', 'moire', 'moray', 'mossy', 'muddy', 'muggy', 'muser', 'named', 'nasty', 'never', 'newly', 'noise', 'nones', 'nosey', 'nutty', 'oakum', 'odour',
	        'orang', 'outgo', 'ozone', 'pacey', 'padre', 'pansy', 'pares', 'pasty', 'peeve', 'perky', 'phase', 'phial', 'piety', 'pivot', 'plain', 'plash', 'plaza', 'plumb', 'plump', 'pocus', 'point', 'poise', 'poler', 'preen', 'prose', 'pulpy',
	        'pulse', 'punch', 'putty', 'quaky', 'quark', 'quiet', 'quilt', 'ravel', 'reach', 'realm', 'regal', 'rider', 'ridge', 'rived', 'roast', 'robes', 'robin', 'robot', 'roger', 'rogue', 'round', 'rugby', 'safes', 'saker', 'salad', 'sauce',
	        'scaly', 'scope', 'scrag', 'screw', 'sedge', 'sever', 'shady', 'shawm', 'shell', 'shift', 'shire', 'shoal', 'short', 'sixer', 'sixth', 'slave', 'slide', 'slope', 'snoop', 'snuff', 'speed', 'spicy', 'spiel', 'spill', 'spook', 'spree',
	        'sprig', 'squat', 'stagy', 'stank', 'stoke', 'store', 'strop', 'suave', 'sushi', 'swamp', 'swear', 'sweet', 'swoop', 'syrup', 'talon', 'tamed', 'tench', 'tenon', 'theme', 'threw', 'tidal', 'tizzy', 'topaz', 'toxin', 'tress', 'triad',
	        'trice', 'trove', 'truck', 'tubby', 'tulip', 'tumid', 'twain', 'tweak', 'twist', 'typed', 'uncle', 'untie', 'until', 'upend', 'upset', 'utter', 'vapid', 'vegan', 'viler', 'wacky', 'waltz', 'waxen', 'weave', 'whine', 'whisk', 'whose',
	        'wield', 'willy', 'windy', 'wires', 'women', 'woven', 'wrong', 'xylem', 'yikes', 'yodel', 'yucca', 'abode', 'about', 'adage', 'adapt', 'admen', 'aegis', 'aerie', 'afoot', 'agape', 'alley', 'allow', 'aspen', 'aster', 'atlas', 'aught',
	        'award', 'awash', 'awful', 'backs', 'bacon', 'bargy', 'bathe', 'batty', 'begun', 'belle', 'beret', 'besom', 'binds', 'birch', 'blast', 'bloke', 'blowy', 'blurt', 'boggy', 'boson', 'briar', 'brief', 'bring', 'bruin', 'brute', 'bumpy',
	        'cacti', 'canon', 'caret', 'caste', 'charm', 'cheer', 'chick', 'chime', 'choke', 'chore', 'civet', 'clank', 'clasp', 'cloak', 'clomp', 'close', 'clout', 'coder', 'colon', 'comer', 'conch', 'corny', 'count', 'cover', 'covey', 'crave',
	        'crimp', 'crony', 'cycad', 'daffy', 'debar', 'decaf', 'delta', 'depot', 'derby', 'dicer', 'dicey', 'dowse', 'drawl', 'dream', 'drill', 'drops', 'dunno', 'eagle', 'easer', 'edits', 'elbow', 'elfin', 'emend', 'enema', 'erect', 'ethic',
	        'facer', 'fakir', 'fauna', 'feast', 'ferro', 'ferry', 'fiend', 'final', 'fired', 'firth', 'flash', 'fluff', 'frank', 'fried', 'front', 'froze', 'fryer', 'fusee', 'gable', 'gamut', 'genii', 'geode', 'ghoul', 'glove', 'golly', 'graft',
	        'grebe', 'green', 'groan', 'gross', 'group', 'grown', 'guilt', 'gummy', 'hairy', 'hajji', 'halon', 'hangs', 'harry', 'haunt', 'haver', 'heavy', 'helot', 'hexer', 'hobby', 'hocus', 'holey', 'holly', 'husky', 'hyper', 'icing', 'idiot',
	        'ileum', 'inapt', 'index', 'input', 'junky', 'kiosk', 'knish', 'krona', 'lacer', 'laird', 'lapin', 'largo', 'lathe', 'laugh', 'leaky', 'least', 'legit', 'lemon', 'letup', 'lilac', 'lippy', 'llano', 'lobar', 'lodge', 'lotus', 'lumpy',
	        'lunar', 'lunch', 'lurex', 'lyric', 'mammy', 'manse', 'maria', 'maths', 'maxim', 'merit', 'messy', 'mines', 'mitre', 'modus', 'month', 'moody', 'morel', 'motto', 'mourn', 'mouse', 'nappy', 'navel', 'neigh', 'novae', 'nudes', 'nymph',
	        'obese', 'order', 'osier', 'ounce', 'pacts', 'pagan', 'pairs', 'panda', 'panel', 'parch', 'pasta', 'peony', 'pesto', 'piano', 'plaid', 'posts', 'prick', 'prong', 'pshaw', 'pupae', 'pupal', 'pushy', 'pylon', 'quirt', 'quote', 'radio',
	        'radon', 'rally', 'randy', 'range', 'razor', 'rearm', 'rebel', 'recur', 'reeve', 'retro', 'rhino', 'rides', 'rives', 'rondo', 'roost', 'rouge', 'rutty', 'sable', 'sabot', 'salty', 'satin', 'satyr', 'scary', 'scent', 'scull', 'seine',
	        'serge', 'serif', 'shack', 'shale', 'shall', 'shard', 'sheep', 'shiny', 'shone', 'shorn', 'shunt', 'skimp', 'slate', 'slice', 'sling', 'slush', 'smear', 'smelt', 'smoky', 'smote', 'snout', 'solve', 'sough', 'sowed', 'speck', 'spell',
	        'spike', 'spire', 'splat', 'sport', 'spray', 'spume', 'stalk', 'stave', 'stint', 'stony', 'stood', 'storm', 'strew', 'strut', 'study', 'style', 'suede', 'swine', 'tabla', 'tango', 'tardy', 'taupe', 'teach', 'teeny', 'tenor', 'these',
	        'thief', 'thing', 'tiara', 'timed', 'toast', 'toper', 'torso', 'torte', 'trade', 'tramp', 'tread', 'trial', 'troop', 'tryst', 'turbo', 'twerp', 'ulcer', 'under', 'undue', 'unfix', 'unify', 'unity', 'valid', 'vexed', 'voter', 'wafer',
	        'waist', 'waken', 'weary', 'weepy', 'welsh', 'wharf', 'while', 'whirr', 'wormy', 'wrath', 'wreck', 'zilch', 'abeam', 'abler', 'acrid', 'actor', 'acute', 'adopt', 'afore', 'agave', 'agony', 'aided', 'align', 'alike', 'aloud', 'amass',
	        'amigo', 'amino', 'amuse', 'annex', 'antic', 'apple', 'apron', 'armed', 'arson', 'asset', 'awake', 'aware', 'axiom', 'bairn', 'baked', 'barns', 'bears', 'beaut', 'belay', 'belch', 'bezel', 'bider', 'biota', 'bitty', 'bleat', 'blimp',
	        'blood', 'bogey', 'bogus', 'booby', 'books', 'booze', 'borne', 'boyer', 'brash', 'brass', 'brawn', 'bribe', 'briny', 'broth', 'brunt', 'bugle', 'bulge', 'burnt', 'butch', 'butyl', 'caber', 'cacao', 'caddy', 'cadge', 'carpi', 'cater',
	        'cheat', 'check', 'chide', 'chimp', 'cigar', 'cirri', 'clerk', 'climb', 'clonk', 'coach', 'comes', 'crack', 'crate', 'creak', 'crisp', 'cruel', 'crumb', 'crush', 'daunt', 'deals', 'deary', 'defer', 'dense', 'dices', 'didst', 'dippy',
	        'dodge', 'doggo', 'doggy', 'donor', 'doyen', 'drama', 'dress', 'drift', 'ducal', 'dumpy', 'eaten', 'ensue', 'epoxy', 'equal', 'ergot', 'erupt', 'exist', 'exude', 'faire', 'falls', 'fancy', 'feint', 'fetch', 'ficus', 'field', 'fight',
	        'filer', 'filly', 'flake', 'flare', 'flews', 'flier', 'floss', 'flown', 'flunk', 'folds', 'force', 'fraud', 'frill', 'frizz', 'fugal', 'funny', 'garde', 'gaudy', 'gauge', 'gauzy', 'gawky', 'gimpy', 'gipsy', 'glade', 'glaze', 'gloat',
	        'gloom', 'glory', 'going', 'goofy', 'grail', 'grape', 'grime', 'habit', 'hanky', 'harpy', 'hello', 'helve', 'henge', 'hoper', 'hovel', 'humph', 'hutch', 'hyrax', 'imbue', 'jaunt', 'jingo', 'jolly', 'juice', 'karma', 'kiddo', 'kneel',
	        'knell', 'laden', 'larch', 'learn', 'lease', 'ledge', 'leggy', 'lemma', 'lewis', 'light', 'lined', 'lisle', 'lithe', 'livid', 'lochs', 'loopy', 'loose', 'loupe', 'lurer', 'macho', 'madam', 'mania', 'masks', 'match', 'maybe', 'motet',
	        'motor', 'mucus', 'mulch', 'munge', 'mural', 'musty', 'muter', 'nasal', 'natty', 'nervy', 'newer', 'nexus', 'nifty', 'nippy', 'noddy', 'nomad', 'nonce', 'notch', 'nroff', 'nuder', 'oases', 'ochre', 'odium', 'ogive', 'onset', 'optic',
	        'orbit', 'paten', 'patty', 'pause', 'peaky', 'peats', 'pedal', 'pesky', 'phyla', 'picky', 'pilaf', 'plank', 'polio', 'ponce', 'porno', 'posse', 'pouch', 'proud', 'prowl', 'pubes', 'queen', 'ramie', 'ranee', 'react', 'rebid', 'relit',
	        'repel', 'retch', 'revet', 'right', 'risen', 'rotor', 'runny', 'rushy', 'sabre', 'saint', 'samba', 'savoy', 'scamp', 'scant', 'scoop', 'scuff', 'seedy', 'serum', 'sewer', 'shaft', 'shake', 'share', 'shock', 'shoes', 'shoot', 'sieve',
	        'sigma', 'silty', 'skate', 'skull', 'slant', 'sleet', 'slimy', 'sloop', 'smith', 'sneer', 'snick', 'snook', 'softy', 'sooty', 'soppy', 'speak', 'spiny', 'squad', 'stark', 'state', 'stilt', 'sting', 'stool', 'stove', 'stria', 'stuck',
	        'sudsy', 'swart', 'swept', 'swill', 'swish', 'synch', 'tabby', 'tally', 'tansy', 'tarot', 'tasty', 'techs', 'terry', 'times', 'tired', 'tonic', 'totem', 'trace', 'trend', 'trews', 'tried', 'trier', 'trout', 'trunk', 'trust', 'tying',
	        'udder', 'unset', 'usual', 'velar', 'verve', 'vexes', 'video', 'vigil', 'viola', 'viral', 'vocal', 'vodka', 'vogue', 'waive', 'washy', 'water', 'wedge', 'wheel', 'which', 'whiff', 'whirl', 'winch', 'witty', 'wordy', 'world', 'worth',
	        'wrack', 'wreak', 'wroth', 'young', 'zippy', 'abort', 'aches', 'adult', 'again', 'agate', 'agent', 'ahead', 'alder', 'alias', 'alien', 'alone', 'ambit', 'ankle', 'areal', 'arose', 'ashen', 'astir', 'awoke', 'azure', 'babel', 'bails',
	        'balmy', 'banns', 'basil', 'batik', 'baulk', 'bebop', 'beefy', 'befog', 'beige', 'belie', 'beman', 'berth', 'beset', 'bevel', 'bijou', 'bingo', 'black', 'blame', 'bleak', 'blink', 'blush', 'bobby', 'bolus', 'borax', 'bough', 'bowed',
	        'braid', 'brake', 'brier', 'brisk', 'brown', 'built', 'burbs', 'cabin', 'cagey', 'camel', 'canal', 'canto', 'caper', 'cared', 'carob', 'chafe', 'chain', 'chary', 'chink', 'civic', 'clean', 'cling', 'cloud', 'cluck', 'coast', 'coble',
	        'cocoa', 'codon', 'combo', 'conga', 'contd', 'corgi', 'court', 'cower', 'coyed', 'cramp', 'craze', 'crock', 'daily', 'dated', 'decay', 'degas', 'deify', 'deity', 'delay', 'delft', 'demit', 'deter', 'dexes', 'dinar', 'disco', 'ditto',
	        'ditty', 'doors', 'dopey', 'drawn', 'drear', 'drone', 'dryad', 'duple', 'duvet', 'dwelt', 'eater', 'eerie', 'eland', 'endow', 'epoch', 'error', 'ethyl', 'expos', 'exult', 'exurb', 'false', 'fatal', 'fatty', 'fifty', 'fills', 'flail',
	        'fleer', 'flick', 'foggy', 'forty', 'foxes', 'fresh', 'friar', 'frond', 'fugue', 'furry', 'gases', 'gauss', 'gecko', 'glitz', 'godly', 'goody', 'grave', 'great', 'grope', 'grows', 'guild', 'halal', 'hammy', 'haste', 'heady', 'heats',
	        'hefty', 'hertz', 'hirer', 'homey', 'horny', 'hough', 'house', 'hydro', 'hymen', 'idiom', 'imago', 'inlet', 'issue', 'jelly', 'joust', 'judge', 'knick', 'knife', 'kudzu', 'lento', 'lingo', 'liven', 'lives', 'loamy', 'lobby', 'locus',
	        'lolly', 'loved', 'lying', 'matte', 'middy', 'midge', 'mimic', 'mince', 'miser', 'moist', 'money', 'mount', 'mucky', 'music', 'mynah', 'naive', 'nanny', 'night', 'ninja', 'nodal', 'noisy', 'noose', 'nurse', 'offal', 'oncer', 'opens',
	        'orate', 'orris', 'outer', 'overt', 'owned', 'papal', 'pater', 'paxes', 'pekoe', 'pence', 'phage', 'pinch', 'pious', 'pleat', 'polyp', 'prior', 'prone', 'prosy', 'prude', 'psalm', 'purse', 'quart', 'queer', 'quern', 'queue', 'quick',
	        'quill', 'rabbi', 'rainy', 'ranch', 'ranks', 'ratty', 'rehab', 'reign', 'relax', 'renew', 'resat', 'retie', 'rhyme', 'ridgy', 'rodeo', 'salsa', 'saucy', 'scout', 'scram', 'scrap', 'sedgy', 'shank', 'shape', 'sharp', 'shirk', 'shore',
	        'showy', 'shyer', 'skeet', 'skirt', 'slang', 'slunk', 'slurp', 'slyly', 'smart', 'smile', 'sniff', 'snort', 'sooth', 'soupy', 'souse', 'spare', 'spars', 'sperm', 'spoof', 'stamp', 'stead', 'stoat', 'stoic', 'stoop', 'stork', 'story',
	        'stuff', 'sumac', 'surer', 'surge', 'swath', 'swell', 'swift', 'swirl', 'sylph', 'synod', 'tacky', 'talky', 'tarsi', 'tents', 'tepee', 'terse', 'thine', 'those', 'throw', 'thunk', 'tight', 'timid', 'tinge', 'titan', 'toque', 'trawl',
	        'trick', 'trill', 'truly', 'tunny', 'ulnar', 'unban', 'vacua', 'valve', 'verso', 'views', 'vireo', 'virus', 'wager', 'warms', 'whack', 'whale', 'whelm', 'whelp', 'where', 'whiny', 'whist', 'wrest', 'wrung', 'yearn', 'yucky', 'abash',
	        'abuse', 'adore', 'algae', 'algal', 'alive', 'alloy', 'amble', 'among', 'angel', 'angle', 'anion', 'anise', 'aptly', 'asher', 'atone', 'avail', 'avast', 'avoid', 'bagel', 'baize', 'barks', 'baron', 'baser', 'batch', 'begin', 'belly',
	        'below', 'bible', 'bimbo', 'biped', 'blade', 'blanc', 'blaze', 'blind', 'bloat', 'block', 'bloom', 'bloop', 'booty', 'bossy', 'bowel', 'breve', 'brick', 'broke', 'brook', 'buddy', 'budge', 'buggy', 'buxom', 'byway', 'cadre', 'calve',
	        'calyx', 'candy', 'cants', 'chaff', 'chair', 'champ', 'chant', 'chase', 'chock', 'churl', 'cites', 'clash', 'class', 'clear', 'cleft', 'clone', 'cloth', 'clump', 'codec', 'colic', 'comet', 'corks', 'could', 'covet', 'coypu', 'crank',
	        'creek', 'croak', 'croon', 'crust', 'curie', 'cycle', 'dairy', 'datum', 'dealt', 'defog', 'dingo', 'dingy', 'dolly', 'dough', 'dowdy', 'dozen', 'draft', 'drake', 'drive', 'droll', 'dross', 'drown', 'drunk', 'dummy', 'dusky', 'dying',
	        'eager', 'earth', 'elute', 'elven', 'enrol', 'erase', 'facet', 'fames', 'fanny', 'farer', 'fatso', 'fault', 'fence', 'feral', 'fichu', 'fifth', 'finch', 'first', 'fiver', 'fixed', 'fjord', 'flask', 'fleck', 'flint', 'flood', 'flour',
	        'flows', 'fogey', 'forge', 'forms', 'forth', 'foyer', 'froth', 'frump', 'fuels', 'fungi', 'funky', 'furze', 'gaffe', 'gamma', 'genre', 'ghost', 'gland', 'gleam', 'gnash', 'gotta', 'grain', 'grate', 'grove', 'gruel', 'guava', 'guile',
	        'gully', 'gusto', 'gusty', 'gypsy', 'hatch', 'heads', 'heart', 'houri', 'hubby', 'hullo', 'hydra', 'hyena', 'iliac', 'inner', 'jabot', 'jazzy', 'jongg', 'juror', 'kayak', 'khaki', 'knave', 'knoll', 'known', 'koala', 'lanky', 'leafy',
	        'leant', 'lieux', 'limbo', 'liver', 'lofty', 'loper', 'lossy', 'lucre', 'luxes', 'maker', 'mange', 'manic', 'manor', 'manta', 'mason', 'mater', 'mauve', 'mayst', 'melon', 'merry', 'metal', 'minty', 'mixer', 'mosey', 'moult', 'mousy',
	        'mulct', 'namby', 'namer', 'narky', 'natal', 'nerdy', 'ninny', 'oaken', 'oasis', 'oaten', 'occur', 'okapi', 'oldie', 'organ', 'otter', 'paged', 'palmy', 'pamby', 'paper', 'parky', 'parry', 'pasha', 'payer', 'peace', 'penal', 'phlox',
	        'phone', 'pixel', 'plate', 'pluck', 'plush', 'poesy', 'power', 'proof', 'proxy', 'pubis', 'quell', 'quiff', 'quire', 'radix', 'raker', 'rangy', 'reads', 'relay', 'remap', 'remit', 'revue', 'rheum', 'ropey', 'roust', 'ruled', 'ruler',
	        'rumba', 'rupee', 'saggy', 'salon', 'saved', 'scarf', 'scene', 'schwa', 'scree', 'scrub', 'scrum', 'sepia', 'sepoy', 'servo', 'sexed', 'shave', 'sheaf', 'shrew', 'sinew', 'sized', 'skunk', 'slept', 'slick', 'smell', 'snack', 'sneak',
	        'snipe', 'sober', 'solar', 'sonny', 'spank', 'spiky', 'spiry', 'spite', 'spoke', 'spoon', 'spore', 'sprat', 'spumy', 'spurt', 'squab', 'steal', 'stomp', 'stout', 'strap', 'stunk', 'sully', 'swain', 'swami', 'sward', 'swash', 'sweep',
	        'swipe', 'sworn', 'taken', 'taunt', 'taxed', 'taxer', 'tells', 'tempi', 'tends', 'tense', 'tepid', 'theta', 'thick', 'third', 'thong', 'three', 'thrum', 'thyme', 'tibia', 'toddy', 'toity', 'toots', 'touch', 'toxic', 'trait', 'trike',
	        'tutti', 'twice', 'ukase', 'ulnae', 'umbra', 'union', 'usher', 'using', 'uteri', 'venom', 'verse', 'vetch', 'viand', 'vivid', 'voice', 'wards', 'watch', 'weedy', 'weird', 'whole', 'wimpy', 'wraps', 'write', 'wryer', 'yahoo', 'yobbo' ];

	$scope.$on('$viewContentLoaded', function(event) {
		input = document.getElementById('words');
		buttonNext = document.getElementById('buttonNext');
		input.disabled = true;
		initCtx();

		window.onresize = function() {
			if ($location.path() === '/gameTutorial') {
				resizeCanvas();
			}
		};

		$scope.words = '';
		word = unitsWords[Math.floor(Math.random() * unitsWords.length)];

		refresh();
	});

	// canvas initialization
	var initCtx = function() {
		var canvas = document.getElementById('gameCanvas');
		canvas.height = height;
		canvas.width = width;
		ctxSpecial = canvas.getContext('2d');
		ctxSpecial.font = "20px Audiowide";
		ctxSpecial.textAlign = 'center';
		ctxSpecial.strokeStyle = specialColor;
		ctxSpecial.shadowColor = specialColor;
		ctxSpecial.fillStyle = specialColor;
		ctxSpecial.lineWidth = 1;

		canvas = document.getElementById('imgCanvas');
		canvas.height = height2;
		canvas.width = width;
		ctxImage = canvas.getContext('2d');
		drawImage();

		canvas = document.getElementById('backgroundCanvas');
		canvas.height = height;
		canvas.width = width;
		ctxBackground = canvas.getContext('2d');
		drawScenario();

		canvas = document.getElementById('particlesCanvas');
		canvas.height = height;
		canvas.width = width;
		ctxParticles = canvas.getContext('2d');

		canvas = document.getElementById('panelCanvas');
		canvas.height = height2;
		canvas.width = width;
		ctxInfoBox = canvas.getContext('2d');
		drawInfoBox();

		canvas = document.getElementById('unitsCanvas');
		canvas.height = height;
		canvas.width = width;
		ctxUnits = canvas.getContext('2d');
		ctxUnits.strokeStyle = color;
		ctxUnits.fillStyle = "#000000";
		ctxUnits.lineWidth = 3;

		canvas = document.getElementById('enemiesCanvas');
		canvas.height = height;
		canvas.width = width;
		ctxEnemies = canvas.getContext('2d');
		ctxEnemies.strokeStyle = enemiesColor;
		ctxEnemies.lineWidth = 3;
		ctxEnemies.font = "20px Audiowide";
		ctxEnemies.textAlign = 'center';

		canvas = document.createElement("canvas");
		canvas.height = height;
		canvas.width = width;
		auxCtx = canvas.getContext('2d');
		auxCtx.font = "40px Audiowide";
		auxCtx.textAlign = 'center';

		canvas = document.getElementById("tutorialMessagesCanvas");
		canvas.height = heightTutorial;
		canvas.width = widthTutorial;
		ctxTutorial = canvas.getContext('2d');
		ctxTutorial.font = "30px Audiowide";
		ctxTutorial.textAlign = 'center';
		drawTutorial(tutorialStep);

		resizeCanvas();
	};

	// canvas resize
	var resizeCanvas = function() {
		var newWidth = document.getElementById('gameTutorial').clientWidth;
		var scale = (newWidth / widthTutorial);
		document.getElementById('gameTutorial').style.height = heightTutorial * scale + 'px';
		var padding = 100 * scale;
		document.getElementById('gameTutorial').style.padding = padding + 'px';
		document.getElementById('gameTutorial').style.margin = -padding + 'px auto 0 auto';
		document.getElementById('canvasBox').style.margin = padding / 10 + 'px 0 0 0';
		document.getElementById('canvasBox').style.height = height * scale + 'px';
		document.getElementById('canvasInfo').style.margin = padding / 10 + 'px 0 0 0';
		document.getElementById('canvasInfo').style.height = height2 * scale + 'px';
		if (newWidth < 600) {
			mobile = true;
		} else {
			mobile = false;
		}
	};

	// canvas refresh loop
	var refresh = function() {
		if (!input.disabled) {
			input.focus();
		}
		draw();
		interval = window.requestAnimationFrame(refresh);
	};

	$scope.$watch('words', function(newValue, oldValue) {
		refreshWord();
	});

	// send word to server
	/* todo */
	$scope.sendWords = function() {
		var correct = $scope.words == word;

		if (correct && tutorialStep == 2) {
			input.disabled = true;
			buttonNext.disabled = false;
			word = unitsWords[Math.floor(Math.random() * unitsWords.length)];
			units.push({
			    x : 0,
			    y : 90,
			    speed : 2
			});
			$scope.nextStep();
		} else if (tutorialStep == 4) {
			for (var i = 0; i < enemies.length; i++) {
				if ($scope.words == enemies[i].word) {
					input.disabled = true;
					tutorialPaused = false;
					newExplision(width - enemies[i].x, height - enemies[i].y, enemiesColor);
					enemies.splice(i, 1);
					i--;
					$scope.nextStep();
					correct = true;
				}
			}
		} else if (tutorialStep == 5) {
			if ($scope.words == special.getWord()) {
				input.disabled = true;
				tutorialPaused = false;
				buttonNext.disabled = false;
				specialExplosion();
				special = null;
				correct = true;
				$scope.nextStep();
			}
		}

		for (var i = 0; i < wordParticles.length; i++) {
			var a = (2 * Math.PI) / 360 * Math.random() * 360;
			var particleData = wordParticles[i].getData();
			particles.push(new Particle(particleData.x, particleData.y, a, Math.random() * 5 + 1, (correct) ? particleData.color : "#FF0000", 2));
		}
		$scope.words = '';
	};

	$scope.nextStep = function() {
		ctxTutorial.clearRect(0, 0, widthTutorial, heightTutorial);
		tutorialStep++;
		if (tutorialStep > 6) {
			window.cancelAnimationFrame(interval);
			$location.path('/');
		}
		if (tutorialStep == 1) {
			drawTutorial(tutorialStep);
		} else if (tutorialStep == 2) {
			drawTutorial(tutorialStep);
			buttonNext.disabled = true;
		} else if (tutorialStep == 4) {
			buttonNext.disabled = true;
			enemies.push({
			    x : 0,
			    y : 90,
			    word : unitsWords[Math.floor(Math.random() * unitsWords.length)],
			    speed : 2
			});
		} else if (tutorialStep == 5) {
			special = new Special();
		}
		tutorialPaused = false;

	};

	$scope.$on('$locationChangeStart', function(next, current) {
		gameRuning = false;
		window.cancelAnimationFrame(interval);
	});

	// draw functions
	var draw = function() {
		if (gameRuning) {
			drawInfoBox();
			drawSpecial();
			drawUnits();
			drawEnemies();
			drawParticles();
		}
	};

	var drawTutorial = function(step) {
		ctxTutorial.clearRect(0, 0, widthTutorial, heightTutorial);
		switch (step) {
		case 1:
			ctxTutorial.strokeStyle = specialColor;
			ctxTutorial.lineWidth = 5;
			ctxTutorial.save();
			ctxTutorial.scale(1, 0.3);
			ctxTutorial.beginPath();
			ctxTutorial.arc(340, 170 / 0.3, 250, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			ctxTutorial.restore();
			ctxTutorial.save();
			ctxTutorial.scale(1, 0.3);
			ctxTutorial.beginPath();
			ctxTutorial.arc(1060, 170 / 0.3, 250, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			ctxTutorial.restore();
			drawMessage(700, 400);
			ctxTutorial.fillStyle = specialColor;
			ctxTutorial.fillText('Here you can see the', 700, 450);
			ctxTutorial.fillText('life bar, score and', 700, 500);
			ctxTutorial.fillText('avatar photo', 700, 550);
			break;
		case 2:
			ctxTutorial.strokeStyle = specialColor;
			ctxTutorial.lineWidth = 5;
			ctxTutorial.save();
			ctxTutorial.scale(1, 0.3);
			ctxTutorial.beginPath();
			ctxTutorial.arc(700, 170 / 0.3, 250, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			ctxTutorial.restore();
			drawMessage(700, 400);
			ctxTutorial.fillStyle = specialColor;
			ctxTutorial.fillText('Try to type this word!', 700, 480);
			ctxTutorial.fillText('(pay attention to', 700, 530);
			ctxTutorial.fillText('the countdown)', 700, 580);
			input.disabled = false;
			break;
		case 3:
			ctxTutorial.strokeStyle = specialColor;
			ctxTutorial.lineWidth = 5;
			ctxTutorial.beginPath();
			ctxTutorial.arc(300, 310, 100, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			drawMessage(700, 400);
			ctxTutorial.fillStyle = specialColor;
			ctxTutorial.fillText('this is your unit, if the', 700, 450);
			ctxTutorial.fillText('countdown of the word', 700, 500);
			ctxTutorial.fillText('ends it will be launched', 700, 550);
			ctxTutorial.fillText('at a slower speed', 700, 600);
			break;
		case 4:
			ctxTutorial.strokeStyle = specialColor;
			ctxTutorial.lineWidth = 5;
			ctxTutorial.beginPath();
			ctxTutorial.arc(1100, 720, 100, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			drawMessage(700, 400);
			ctxTutorial.fillStyle = specialColor;
			ctxTutorial.fillText('this is an enemy unit, if', 700, 450);
			ctxTutorial.fillText('you want to kill them, you', 700, 500);
			ctxTutorial.fillText('will have to type the word.', 700, 550);
			ctxTutorial.fillText('let\'s try!', 700, 600);
			input.disabled = false;
			break;
		case 5:
			ctxTutorial.strokeStyle = specialColor;
			ctxTutorial.lineWidth = 5;
			ctxTutorial.beginPath();
			ctxTutorial.arc(700, 500, 100, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			drawMessage(1080, 400);
			ctxTutorial.fillStyle = specialColor;
			ctxTutorial.fillText('this is an special event, if', 1080, 450);
			ctxTutorial.fillText('you type this before your', 1080, 500);
			ctxTutorial.fillText('oponent you will win it.', 1080, 550);
			ctxTutorial.fillText('let\'s try!', 1080, 600);
			input.disabled = false;
			break;
		case 6:
			ctxTutorial.strokeStyle = specialColor;
			ctxTutorial.lineWidth = 5;
			ctxTutorial.beginPath();
			ctxTutorial.arc(700, 500, 100, 0, Math.PI * 2);
			ctxTutorial.stroke();
			ctxTutorial.closePath();
			drawMessage(700, 400);
			ctxTutorial.fillStyle = specialColor;
			ctxTutorial.fillText('that is all, let\'s play!', 700, 500);
			break;
		}
	};

	var drawMessage = function(x, y) {
		var rectWidth = 470;
		var rectHeight = 250;
		var cornerRadius = 10;
		ctxTutorial.fillStyle = '#000000';
		ctxTutorial.beginPath();
		ctxTutorial.moveTo(x, y);
		ctxTutorial.lineTo(x + rectWidth / 2 - cornerRadius, y);
		ctxTutorial.quadraticCurveTo(x + rectWidth / 2, y, x + rectWidth / 2, y + cornerRadius);
		ctxTutorial.lineTo(x + rectWidth / 2, y + rectHeight - cornerRadius);
		ctxTutorial.quadraticCurveTo(x + rectWidth / 2, y + rectHeight, x + rectWidth / 2 - cornerRadius, y + rectHeight);
		ctxTutorial.lineTo(x - rectWidth / 2 + cornerRadius, y + rectHeight);
		ctxTutorial.quadraticCurveTo(x - rectWidth / 2, y + rectHeight, x - rectWidth / 2, y + rectHeight - cornerRadius);
		ctxTutorial.lineTo(x - rectWidth / 2, y + cornerRadius);
		ctxTutorial.quadraticCurveTo(x - rectWidth / 2, y, x - rectWidth / 2 + cornerRadius, y);
		ctxTutorial.lineTo(x, y);
		ctxTutorial.fill();
		ctxTutorial.stroke();
	};

	var drawEnemies = function() {
		if (ctxEnemies) {
			ctxEnemies.clearRect(0, 0, width, height);
			for (var i = 0; i < enemies.length; i++) {
				if (!tutorialPaused) {
					enemies[i].x += enemies[i].speed;
				}
				if (enemies[i].x > width) {
					newExplision(enemies[i].x, enemies[i].y, enemiesColor);
					enemies.splice(i, 1);
					i--;
				} else if (tutorialStep == 4 && enemies[i].x > 200 && !tutorialPaused) {
					tutorialPaused = true;
					drawTutorial(tutorialStep);
				} else {
					ctxEnemies.fillStyle = "#000000";
					ctxEnemies.beginPath();
					ctxEnemies.arc(width - enemies[i].x, height - enemies[i].y, 10, 0, 2 * Math.PI);
					ctxEnemies.fill();
					ctxEnemies.stroke();

					ctxEnemies.fillStyle = enemiesColor;
					ctxEnemies.fillText(enemies[i].word, width - enemies[i].x, height - enemies[i].y - 20);
					meteroidParticleGenerator(enemies[i].x, height - enemies[i].y, enemiesColor, 'e');
				}
			}
		}
	};

	var drawUnits = function() {
		if (ctxUnits) {
			ctxUnits.clearRect(0, 0, width, height);
			for (var i = 0; i < units.length; i++) {
				if (!tutorialPaused) {
					units[i].x += units[i].speed;
				}
				if (units[i].x > width) {
					newExplision(units[i].x, units[i].y, color);
					units.splice(i, 1);
					i--;
				} else if (tutorialStep == 3 && units[i].x > 200 && !tutorialPaused) {
					tutorialPaused = true;
					drawTutorial(tutorialStep);
				} else {
					ctxUnits.beginPath();
					ctxUnits.arc(units[i].x, units[i].y, 10, 0, 2 * Math.PI);
					ctxUnits.fill();
					ctxUnits.stroke();
					meteroidParticleGenerator(units[i].x, units[i].y, color);
				}
			}
		}
	};

	var drawParticles = function() {
		ctxParticles.clearRect(0, 0, width, height);
		var i = 0;
		for (i = 0; i < particles.length; i++) {
			if (particles[i].update() > Math.random() * 10 + 30) {
				particles.splice(i, 1);
				i--;
			}
		}

		for (i = 0; i < wordParticles.length; i++) {
			wordParticles[i].update();
		}

		for (i = 0; i < specialParticles.length; i++) {
			if (specialParticles[i] instanceof Particle) {
				if (specialParticles[i].update() > Math.random() * 10 + 30) {
					var data = specialParticles[i].getData();
					specialParticles.splice(i, 1);
					i--;
					specialParticles.push(new SpecialParticle(data.x, data.y, specialTarget.x, specialTarget.y, data.color));
				}
			} else {
				if (specialParticles[i].update() > width || specialParticles[i].update() < 0) {		
					specialParticles.splice(i, 1);
					i--;
				}
			}
		}
		
		if(specialParticles.length < 1 && tutorialStep == 6){
			drawTutorial(tutorialStep);
		}

		if (mobile) {
			ctxParticles.fillStyle = '#0080FF';
			ctxParticles.font = "40px Audiowide";
			ctxParticles.textAlign = 'center';
			ctxParticles.fillText($scope.words, width / 2, 100);
		}
	};

	var drawSpecial = function() {
		if (ctxSpecial) {
			ctxSpecial.clearRect(0, 0, width, height);
			if (special) {
				special.update();
			}
		}
	};

	var drawImage = function() {
		ctxImage.drawImage(userImg, 320, 10, 80, 80);
		ctxImage.drawImage(oponentImg, 800, 10, 80, 80);
	};

	var drawScenario = function() {
		ctxBackground.fillStyle = "#000000";
		ctxBackground.strokeStyle = color;
		ctxBackground.shadowColor = color;
		ctxBackground.lineWidth = 3;
		ctxBackground.shadowBlur = shadowBlur;
		ctxBackground.beginPath();
		ctxBackground.arc(-Math.cos(Math.asin(height / (height * 4))) * height * 2, height / 2, height * 2, -Math.asin(height / (height * 4)), Math.asin(height / (height * 4)));
		ctxBackground.fill();
		ctxBackground.stroke();

		ctxBackground.strokeStyle = enemiesColor;
		ctxBackground.shadowColor = enemiesColor;
		ctxBackground.beginPath();
		ctxBackground.arc(width + Math.cos(Math.asin(height / (height * 4))) * height * 2, height / 2, height * 2, -Math.asin(height / (height * 4)) + Math.PI, Math.asin(height / (height * 4)) + Math.PI);
		ctxBackground.fill();
		ctxBackground.stroke();

		ctxBackground.strokeStyle = specialColor;
		ctxBackground.shadowColor = specialColor;
		ctxBackground.beginPath();
		ctxBackground.arc(width / 2, height + 690, 700, 3 * Math.PI / 2 - Math.atan(100 / 550), 3 * Math.PI / 2 + Math.atan(100 / 550));
		ctxBackground.fill();
		ctxBackground.stroke();

		ctxBackground.lineWidth = 0.1;
		ctxBackground.beginPath();
		ctxBackground.moveTo(width / 2, height - 10);
		ctxBackground.lineTo(width / 2, 0);
		ctxBackground.stroke();
	};

	var drawInfoBox = function() {

		if (ctxInfoBox) {
			ctxInfoBox.clearRect(0, 0, width, height2);

			ctxInfoBox.font = "40px Audiowide";
			ctxInfoBox.textAlign = 'center';
			ctxInfoBox.fillStyle = "#FFFFFF";
			ctxInfoBox.fillText(word, width / 2, 70);
			ctxInfoBox.font = "20px Audiowide";
			if (timeLeft < 10) {
				ctxInfoBox.fillStyle = "#FF0000";
			} else {
				ctxInfoBox.fillStyle = "#FFFFFF";
			}
			ctxInfoBox.fillText(timeLeft, width / 2, 30);
			if (nextWord < 4) {
				ctxInfoBox.fillStyle = "#FF0000";
			} else {
				ctxInfoBox.fillStyle = "#FFFFFF";
			}
			ctxInfoBox.font = "10px Audiowide";
			ctxInfoBox.fillText(nextWord, width / 2, 90);

			ctxInfoBox.font = "30px Audiowide";
			ctxInfoBox.textAlign = 'left';
			ctxInfoBox.fillStyle = color;
			ctxInfoBox.strokeStyle = color;
			ctxInfoBox.fillText(player.score, 20, 80);
			ctxInfoBox.strokeRect(20, 20, 200, 15);
			ctxInfoBox.fillRect(20, 20, player.life * 2, 15);

			ctxInfoBox.fillStyle = enemiesColor;
			ctxInfoBox.strokeStyle = enemiesColor;
			ctxInfoBox.textAlign = 'right';
			ctxInfoBox.fillText(enemy.score, width - 20, 80);
			ctxInfoBox.strokeRect(width - 220, 20, 200, 15);
			ctxInfoBox.fillRect(width - 220 + (100 - enemy.life) * 2, 20, enemy.life * 2, 15);
		}

	};

	// refresh word particles
	var refreshWord = function() {
		if (auxCtx && !mobile) {
			auxCtx.fillStyle = '#FFFFFF';
			auxCtx.fillRect(0, 0, width, height);
			auxCtx.fillStyle = '#000000';
			auxCtx.fillText($scope.words, width / 2, 100);
			var image_data = auxCtx.getImageData(0, 0, width, height);
			var pixels = image_data.data;
			var positions = [];
			var i = 0;
			for (i = 0; i < width; i += 2) {
				for (var j = 0; j < height; j += 2) {
					if (pixels[i * 4 + j * width * 4] !== 255) {
						positions.push({
						    x : i,
						    y : j
						});
					}
				}
			}

			if (positions.length < wordParticles.length) {
				wordParticles.splice(positions.length, wordParticles.length);
			}
			for (i = 0; i < positions.length; i++) {
				if (i < wordParticles.length) {
					wordParticles[i].setTarget(positions[i].x, positions[i].y);
				} else {
					var a = Math.random() * Math.PI * 2;
					wordParticles.push(new WordParticle(width / 2, 100, positions[i].x, positions[i].y, textColor[Math.floor(Math.random() * textColor.length)]));
				}
			}
		}
	};

	// particles generator
	var meteroidParticleGenerator = function(x, y, c, type) {
		var px;
		var a;
		if (type === 'e') {
			a = (Math.random() * (Math.PI / 2) - (Math.PI / 4));
			px = Math.cos(a) * 10 + width - x;
		} else {
			a = (Math.random() * (Math.PI / 2) - (Math.PI / 4)) + Math.PI;
			px = Math.cos(a) * 10 + x;
		}
		var py = Math.sin(a) * 10 + y;
		particles.push(new Particle(px, py, a, 1, c, 1));
	};

	// explosion generator
	var newExplision = function(x, y, c) {
		for (var i = 0; i < explosionParticles; i++) {
			var a = (2 * Math.PI) / explosionParticles * i;
			var px = Math.cos(a) * 10 + x;
			var py = Math.sin(a) * 10 + y;
			particles.push(new Particle(px, py, a, Math.random() * 5 + 1, c, 2));
		}
	};

	// special explosion generator
	var specialExplosion = function() {
		for (var i = 0; i < 90; i++) {
			var a = (2 * Math.PI) / explosionParticles * i;
			var px = Math.cos(a) * 10 + width / 2;
			var py = Math.sin(a) * 10 + height / 2;
			specialParticles.push(new Particle(px, py, a, Math.random() * 5 + 1, specialColor, 2));
		}
	};

	// special object manager
	function Special() {
		var x = width / 2;
		var y = height - 10;
		var rad = 0;
		var word = 'reinforcement';
		var increase = true;
		var ready = false;
		var readySent = false;

		this.getWord = function() {
			return word;
		};

		this.update = function() {
			if (rad > 3 && y > height / 2) {
				y--;
			} else if (rad < 4) {
				rad += 0.05;
			} else if (y <= height / 2 && increase) {
				rad += 0.05;
			} else if (y <= height / 2 && !increase) {
				rad -= 0.05;
			}

			if (rad >= 15) {
				increase = false;
				ready = true;
			} else if (rad <= 14) {
				increase = true;
			}

			if (ready && !readySent) {
				readySent = true;
			}
			draw();
		};

		var draw = function() {
			ctxSpecial.beginPath();
			ctxSpecial.arc(x, y, rad, 0, 2 * Math.PI);
			ctxSpecial.fill();
			ctxSpecial.stroke();
			if (rad > 3 && rad < 5) {
				ctxSpecial.beginPath();
				ctxSpecial.moveTo(x, y - rad - 2);
				ctxSpecial.lineTo(x, y + rad + 2);
				ctxSpecial.stroke();

			}
			if (readySent) {
				ctxSpecial.fillText(word, x, y - 30);
				if (!specialTutorial) {
					drawTutorial(tutorialStep);
					specialTutorial = false;
				}
			}
		};
	}

	// particles objects
	function Particle(x, y, a, s, c, sz) {
		var px = x;
		var py = y;
		var angle = a;
		var speed = s;
		var color = c;
		var alfa = 0;
		var size = sz;

		this.getData = function() {
			return {
			    color : color,
			    x : px,
			    y : py
			};
		};

		this.update = function() {
			move();
			draw();
			alfa++;
			return alfa;
		};

		var move = function() {
			px += Math.cos(angle) * speed;
			py += Math.sin(angle) * speed;
		};

		var draw = function() {
			ctxParticles.fillStyle = color;
			ctxParticles.fillRect(px, py, size, size);
		};
	}

	function WordParticle(x, y, tx, ty, c) {
		var px = x;
		var py = y;
		var targetX = tx;
		var targetY = ty;
		var angle;
		var speed;
		var color = c;

		this.setTarget = function(x, y) {
			targetX = x;
			targetY = y;
		};

		this.getData = function() {
			return {
			    color : color,
			    x : px,
			    y : py
			};
		};

		this.update = function() {
			if ((px < targetX - 1 || px > targetX + 1) && (py < targetY - 1 || py > targetY + 1)) {
				var mod = Math.sqrt(Math.pow(targetX - px, 2) + Math.pow(targetY - py, 2));
				var x = targetX - px;
				var y = targetY - py;
				angle = Math.acos(x / mod);
				if (y < 0) {
					angle = -angle;
				}
				speed = mod / 2;
				if (speed < 1) {
					speed = 1;
				}
				move();
			} else {
				px = targetX;
				py = targetY;
				speed = 0;
			}
			draw();
		};

		var move = function() {
			px += Math.cos(angle) * speed;
			py += Math.sin(angle) * speed;
		};

		var draw = function() {
			ctxParticles.fillStyle = color;
			ctxParticles.fillRect(px, py, 2, 2);
		};
	}

	function SpecialParticle(x, y, tx, ty, c) {
		var px = x;
		var py = y;
		var targetX = tx;
		var targetY = ty;
		var angle;
		var speed = 15;
		var color = c;

		this.update = function() {
			var mod = Math.sqrt(Math.pow(targetX - px, 2) + Math.pow(targetY - py, 2));
			var x = targetX - px;
			var y = targetY - py;
			angle = Math.acos(x / mod);
			if (y < 0) {
				angle = -angle;
			}
			move();
			draw();
			return px;
		};

		var move = function() {
			px += Math.cos(angle) * speed;
			py += Math.sin(angle) * speed;
		};

		var draw = function() {
			ctxParticles.fillStyle = color;
			ctxParticles.fillRect(px, py, 2, 2);
		};
	}

	var myRequestAnimationFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();

	window.requestAnimationFrame = myRequestAnimationFrame;

});
