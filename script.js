const sourceText = document.getElementById('sourceText');
const charCount = document.getElementById('charCount');
const simplifyBtn = document.getElementById('simplifyBtn');
const exampleBtn = document.getElementById('exampleBtn');
const clearBtn = document.getElementById('clearBtn');
const emptyState = document.getElementById('emptyState');
const results = document.getElementById('results');
const statusBadge = document.getElementById('statusBadge');

const example = `The applicant must submit the required documentation within 14 calendar days of receiving this notice. Failure to provide complete documentation within the specified period may result in the application being considered incomplete and may delay processing. Applicants should retain copies of all submitted materials for their records.`;

const definitions = {
  'documentation':'Documents or records that provide proof or information.',
  'specified period':'The exact amount of time allowed.',
  'processing':'The steps taken to review and handle a request.',
  'application':'A formal request for something.',
  'incomplete':'Missing one or more required parts.',
  'implementation':'Putting a plan or decision into action.',
  'methodology':'The method or process used to do something.',
  'analysis':'A careful study of information to understand it.',
  'interpretation':'The meaning you understand from information.',
  'compliance':'Following a rule, law, or requirement.',
  'confidential':'Private information that should not be shared freely.',
  'mandatory':'Required; you must do it.',
  'optional':'Not required; you can choose whether to do it.',
  'deadline':'The latest time or date to finish something.',
  'criteria':'The standards used to judge or decide something.',
  'approximately':'Nearly, but not exactly.',
  'subsequently':'After that; later.',
  'prior to':'Before something happens.',
  'in accordance with':'Following or matching a rule or instruction.',
  'mitigate':'To reduce the seriousness or impact of something.',
  'optimization':'Making something work as effectively as possible.'
};

function updateCount() {
  charCount.textContent = `${sourceText.value.length.toLocaleString()} characters`;
}
sourceText.addEventListener('input', updateCount);

function splitSentences(text) {
  return text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]?/g)?.map(s => s.trim()).filter(Boolean) || [];
}

function simplifySentence(sentence) {
  let s = sentence;
  const replacements = [
    [/\bin the event that\b/gi, 'if'],
    [/\bprior to\b/gi, 'before'],
    [/\bsubsequently\b/gi, 'later'],
    [/\bin accordance with\b/gi, 'following'],
    [/\bfor the purpose of\b/gi, 'to'],
    [/\bat this point in time\b/gi, 'now'],
    [/\bwith regard to\b/gi, 'about'],
    [/\bhas the ability to\b/gi, 'can'],
    [/\bis required to\b/gi, 'must'],
    [/\bare required to\b/gi, 'must'],
    [/\bcommence\b/gi, 'start'],
    [/\bterminate\b/gi, 'end'],
    [/\butilize\b/gi, 'use'],
    [/\bapproximately\b/gi, 'about'],
    [/\bendeavor\b/gi, 'try'],
    [/\bmitigate\b/gi, 'reduce'],
    [/\bfacilitate\b/gi, 'help'],
    [/\bdemonstrate\b/gi, 'show'],
    [/\bdetermine\b/gi, 'find out'],
    [/\badditional\b/gi, 'extra'],
    [/\bprioritize\b/gi, 'focus on first'],
    [/\bsubmit\b/gi, 'send in'],
    [/\bretain\b/gi, 'keep'],
    [/\bobtain\b/gi, 'get'],
    [/\bcommence\b/gi, 'begin'],
    [/\btherefore\b/gi, 'so'],
    [/\bhowever\b/gi, 'but'],
    [/\bfurthermore\b/gi, 'also'],
    [/\binitially\b/gi, 'at first'],
    [/\bsubstantial\b/gi, 'large'],
    [/\bmethodology\b/gi, 'method'],
    [/\bdocumentation\b/gi, 'documents'],
    [/\bspecified period\b/gi, 'given time'],
    [/\bwithin the specified period\b/gi, 'within that time'],
    [/\bfailure to\b/gi, 'if you do not'],
    [/\bmay result in\b/gi, 'may cause'],
    [/\bconsidered incomplete\b/gi, 'treated as unfinished'],
    [/\bfor their records\b/gi, 'for their own reference']
  ];
  replacements.forEach(([pattern, replacement]) => s = s.replace(pattern, replacement));
  s = s.replace(/\bthe applicant\b/gi, 'you');
  s = s.replace(/\bapplicants\b/gi, 'you');
  s = s.replace(/\bapplicant\b/gi, 'you');
  return s;
}

function collectTerms(text) {
  const lower = text.toLowerCase();
  return Object.entries(definitions)
    .filter(([term]) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower))
    .slice(0, 8);
}

function renderList(element, items) {
  element.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    element.appendChild(li);
  });
}

function simplify() {
  const raw = sourceText.value.trim();
  if (!raw) {
    sourceText.focus();
    sourceText.style.borderColor = '#d65b5b';
    setTimeout(() => sourceText.style.borderColor = '', 1200);
    return;
  }

  const sentences = splitSentences(raw);
  const simplified = sentences.map(simplifySentence).join(' ');
  document.getElementById('simpleText').textContent = simplified;

  const takeaways = sentences.slice(0, 5).map(s => {
    const clean = simplifySentence(s).replace(/[.!?]+$/, '');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  });
  renderList(document.getElementById('keyPoints'), takeaways.length ? takeaways : ['Review the provided information carefully.']);

  const termContainer = document.getElementById('terms');
  termContainer.innerHTML = '';
  const foundTerms = collectTerms(raw);
  if (foundTerms.length) {
    foundTerms.forEach(([term, meaning]) => {
      const chip = document.createElement('div');
      chip.className = 'term-chip';
      const strong = document.createElement('strong');
      strong.textContent = term.charAt(0).toUpperCase() + term.slice(1);
      const span = document.createElement('span');
      span.textContent = meaning;
      chip.append(strong, span);
      termContainer.appendChild(chip);
    });
  } else {
    const p = document.createElement('p');
    p.className = 'simple-text';
    p.textContent = 'No terms from the built-in glossary were detected. Add unfamiliar terms to a future glossary or check a trusted dictionary.';
    termContainer.appendChild(p);
  }

  const hasDeadline = /\b(day|days|deadline|within|by \w+day|hours|weeks|months)\b/i.test(raw);
  const hasMust = /\bmust|required|mandatory|should|need to|submit|send in\b/i.test(raw);
  let next = 'Compare this explanation with the original text and identify any details that matter to your situation.';
  if (hasDeadline && hasMust) next = 'Check the deadline and list the required actions. Keep copies of anything you submit, and confirm requirements with the original source.';
  else if (hasDeadline) next = 'Look for any dates or time limits in the original text and add them to your calendar if relevant.';
  else if (hasMust) next = 'Identify which actions are required, who is responsible, and what evidence or information is needed.';
  document.getElementById('nextStep').textContent = next;

  emptyState.classList.add('hidden');
  results.classList.remove('hidden');
  statusBadge.textContent = 'Explanation ready';
  statusBadge.style.background = '#e8f7f1';
  statusBadge.style.color = '#23876d';
}

simplifyBtn.addEventListener('click', simplify);
exampleBtn.addEventListener('click', () => {
  sourceText.value = example;
  updateCount();
  simplify();
});
clearBtn.addEventListener('click', () => {
  sourceText.value = '';
  updateCount();
  results.classList.add('hidden');
  emptyState.classList.remove('hidden');
  statusBadge.textContent = 'Waiting for text';
  statusBadge.removeAttribute('style');
});
document.getElementById('copyBtn').addEventListener('click', async () => {
  const simple = document.getElementById('simpleText').textContent;
  const keys = [...document.querySelectorAll('#keyPoints li')].map(li => `• ${li.textContent}`).join('\n');
  const terms = [...document.querySelectorAll('#terms .term-chip')].map(chip => `${chip.querySelector('strong').textContent}: ${chip.querySelector('span').textContent}`).join('\n');
  const output = `IN SIMPLE WORDS\n${simple}\n\nKEY TAKEAWAYS\n${keys}\n\nTERMS TO KNOW\n${terms || 'No glossary terms detected.'}\n\nWHAT TO DO NEXT\n${document.getElementById('nextStep').textContent}`;
  const button = document.getElementById('copyBtn');
  try {
    await navigator.clipboard.writeText(output);
    button.textContent = 'Copied!';
    setTimeout(() => button.textContent = 'Copy explanation', 1500);
  } catch {
    button.textContent = 'Copy unavailable in this browser';
    setTimeout(() => button.textContent = 'Copy explanation', 1800);
  }
});
