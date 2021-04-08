// Its a simple node script which uses our js client to make various API calls.
// The responses received from those calls are written to a typescript file and compared against there corresponding
// APIResponse types, specified in declaration file - types/stream-chat/index.d.ts
const fs = require('fs');
const { exec } = require('child_process');

const executables = [
  'create-channels',
  ['reset-channels', 'create-channels'],
  'reset-all-channels',
  'create-app-users',
  'create-channel-members',
  'add-messages',
  'create-user',
  'hide-channel',
  'show-channel',
  'delete-channel',
  'add-member',
  'add-moderator',
  'remove-member',
  'delete-image',
  'playground',
];

let countExecutables = 0;

let tsFileName;
const run = () => {
  tsFileName = `${__dirname}/../doc.md`;
  const docTitle = [
    `# Command docs`,
    `> - These are auto-generated docs using [script](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/generate-doc.js) or \`yarn build\`. Please don't modify them directly.`,
    `> - All the following commands accept --config or -c argument. Its a config file which contains your app config (apiKey, secret etc)`,
    `___`,
    '\n',
  ];
  fs.writeFile(tsFileName, docTitle.join('\n'), async function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('✅ Doc writing started!');
    for (let i = 0; i < executables.length; i++) {
      const executable = executables[i];
      await executeAndWrite(executable);
    }
  });
};

const executeAndWrite = (command, name, type) =>
  new Promise((resolve) => {
    try {
      const executableCmd = Array.isArray(command) ? command[0] : command;
      const aliasOf = Array.isArray(command) ? `${command[1]}` : null;

      exec(`${executableCmd} --help`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
        }

        const output = stdout.split('\n');
        // Remove the first two lines of output, which is generally executed command.
        output.splice(0, 2);
        // Remove the last line, which is usually response time.
        output.splice(-2);

        const indexOfOptions = output.findIndex((s) => s.indexOf('Options:') === 0);
        const description = output.slice(0, indexOfOptions).join('\n');
        const options = output.slice(indexOfOptions + 1).join('\n');

        const displayOutput = [
          `## \`${executableCmd} --help\``,
          `### Description`,
          `**Source**: [bin/${executableCmd}.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/${
            aliasOf || executableCmd
          }.js)\n`,
          `${aliasOf ? `Alias of ${aliasOf}` : description}`,
          `### Options`,
          `\`\`\`sh\n${options}\n\`\`\`\n`,
          `___`,
        ];

        fs.appendFile(tsFileName, `${displayOutput.join('\n')}\n`, function (err) {
          if (err) {
            return console.log(err);
          }

          console.log(`✅ ${command}`);
          countExecutables++;
          checkIfComplete();
          resolve();
        });
      });

      return;
    } catch (error) {
      console.log(`❌ ${command} failed with error: `, error);
      process.exit(1);
    }
  });

function checkIfComplete() {
  if (countExecutables === executables.length) {
    console.log();
    process.exit();
  }
}

run();
