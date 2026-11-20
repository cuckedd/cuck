/**
 * REJECT'S WORLD — Interactive mock terminal.
 * Built with real HTML elements and CSS. Commands are local UI demonstrations;
 * this is NOT a network scanner, shell, or remote command executor.
 */
(() => {
  'use strict';
  const output = document.getElementById('terminalOutput');
  const form = document.getElementById('terminalForm');
  const input = document.getElementById('terminalInput');
  if (!output || !form || !input) return;

  const append = (content, style = '') => {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (style ? ' ' + style : '');
    line.textContent = content;
    output.append(line);
    output.scrollTop = output.scrollHeight;
  };
  const appendBlank = () => append('');
  const commands = {
    help: () => {
      append('AVAILABLE COMMANDS', 'terminal-accent');
      append('help      show demo commands');
      append('nmap      show mock scan from the design');
      append('whoami    display current guest');
      append('about     about this website');
      append('date      show local date and time');
      append('clear     clear the terminal');
    },
    nmap: () => {
      append('Under my control', 'terminal-red');
      appendBlank();
      append("rejectsworld.re's Nmap 7.95");
      append('Starting Nmap 7.95 ( https://nmap.org )', 'terminal-accent');
      append('Nmap scan report for rejectsworld.re');
      append('Host is up (0.045s latency).');
      appendBlank();
      append('PORT      STATE  SERVICE  VERSION');
      append('22/tcp    open   ssh      OpenSSH');
      append('80/tcp    open   http     nginx');
      append('443/tcp   open   https    nginx');
      append('3306/tcp  open   mysql    MySQL');
      append('6379/tcp  open   redis    Redis');
      appendBlank();
      append('Nmap done: 1 IP address (1 host up) scanned', 'terminal-muted');
      append('(visual demo, no real scan was performed)', 'terminal-muted');
    },
    whoami: () => append('guest@rejectsworld'),
    about: () => append("REJECT'S WORLD — custom HTML/CSS/JS terminal"),
    date: () => append(new Date().toLocaleString()),
    clear: () => output.replaceChildren()
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const command = input.value.trim();
    if (!command) return;
    append('guest@rejectsworld:~$ ' + command, 'terminal-accent');
    input.value = '';
    const key = command.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(commands, key)) commands[key]();
    else append('command not found: ' + command + ' (type help)', 'terminal-red');
    appendBlank();
  });
  document.getElementById('terminal')?.addEventListener('click', e => {
    if (e.target.closest('input,button,a')) return;
    // Let users select/copy text without stealing focus.
    if (window.getSelection()?.toString()) return;
    input.focus();
  });
})();
