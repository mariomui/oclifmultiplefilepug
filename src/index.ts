import { Command, flags } from "@oclif/command";
import * as pug from "pug";
import ListR, { ListrTask } from "listr";
import { writeFile } from "fs";
import * as path from "path";
import execa from "execa";

interface ITemplatedFile {
  templateLocation: String;
  data: {
    dirPath: String;
    yourMom: String;
    fileName: String;
  };
}
// interface IObjo {
//   err?: unknown;
//   path?: string;
//   desc?: string;
// }
class Mynewcli extends Command {
  static description = "describe the command here";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" }),
  };

  static args = [{ name: "file" }];

  files: ITemplatedFile[] = [
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario1",
        fileName: "mario1",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario2",
        fileName: "mario2",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario3",
        fileName: "mario3",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario4",
        fileName: "mario4",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario5",
        fileName: "mario5",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario6",
        fileName: "mario6",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario7",
        fileName: "mario7",
      },
    },
    {
      templateLocation: "./src/templates/example.pug",
      data: {
        dirPath: "./src/destination",
        yourMom: "mario",
        fileName: "mario",
      },
    },
  ];
  useCreateInMemoryFileSetups = (files: ITemplatedFile[]): any[] => {
    return files.map((file: any) => {
      return [pug.compileFile(file.templateLocation), file.data];
    });
  };

  splitGit = (gitCommand: string): string[] => {
    return gitCommand.slice(1).split(" ");
  };
  getAllAndCommit = () => {
    return {
      title: "getallandcommit",
      task: async (ctx: ListR.ListrContext) => {
        console.log(ctx.currentBranch, "whats my ctx");
        let doNewBranch = false;
        let counter = 0;
        if (ctx.currentBranch === "master") {
          doNewBranch = true;
        }

        await execa("git", ["add", "-A"]);
        await execa("git", ["commit", "-m", '"whassup"']);
        if (doNewBranch) {
          await execa("git", ["checkout", "-b", "" + counter]);
        } else {
          counter = ctx.currentBranch++;
          await execa("git", ["checkout", "-b", "" + ++counter]);
        }
      },
    };
  };
  getCurrentBranch = () => {
    // await Promise.resolve(null);
    // try {

    return {
      title: "addAllAndCommit",
      task: async (ctx: ListR.ListrContext) => {
        const { stdout } = await execa("git", [
          "rev-parse",
          "--abbrev-ref",
          "head",
        ]);
        console.log(stdout, "whats my branch");
        ctx.currentBranch = stdout;
      },
    };
    // }
    //  catch (err) {
    //   return Promise.resolve({
    //     title: "addAllAndCommit",
    //     task: () => {
    //       console.log("kkd");
    //     },
    //   });
    // }
  };

  createFiles = (setups: any[]): Promise<unknown> => {
    const pSetups = setups.map((setup) => {
      console.log(setup);
      const [data, path] = setup;
      return new Promise((resolve, reject) => {
        writeFile(path, data, { flag: "w", encoding: "utf8" }, (err) => {
          if (err) {
            console.log(err);
            reject({ err, desc: "bad error" });
          }
          return resolve({ path, desc: "done" });
        });
      });
    });
    return Promise.all(pSetups);
    // Promise.all())
  };
  runTasks = async (setups: any[]) => {
    if (setups.length === 0) return;
    const task2 = this.getCurrentBranch();
    const task3 = this.getAllAndCommit();
    const listR = new ListR([
      {
        title: "hi",
        task: async () => {
          const waited = await this.createFiles(setups);
          console.log(waited);
        },
      },
      task2,
      task3,
    ]);
    listR.run();
  };
  setups: any[] = [];
  async run() {
    const { args, flags } = this.parse(Mynewcli);

    const name = flags.name ?? "world";
    this.log(`hello ${name} from ./src/index.ts`);
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`);
    }
    const createInMemoryFileSetups = this.useCreateInMemoryFileSetups(
      this.files
    );
    createInMemoryFileSetups.forEach(([useSetup, data]) => {
      const currentPath = path.format({
        dir: data.dirPath,
        name: data.fileName,
        ext: ".html",
      });
      this.setups.push([useSetup(data), currentPath]);
    });

    await this.runTasks(this.setups);
  }
}

export = Mynewcli;
