import { Command, flags } from "@oclif/command";
import * as pug from "pug";
import * as listr from "listr";
import { setupMaster } from "cluster";
import { createWriteStream, fstat, writeFile } from "fs";
import * as path from "path";
interface ITemplatedFile {
  templateLocation: String;
  data: {
    dirPath: String;
    yourMom: String;
    fileName: String;
  };
}
interface IObjo {
  err?: unknown;
  path?: string;
  desc?: string;
}
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
        yourMom: "dana",
        fileName: "dana",
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
  runTasks = (setups: any[]) => {
    if (setups.length === 0) return;
    const listR = new listr([
      {
        title: "hi",
        task: async () => {
          const waited = await this.createFiles(setups);
          console.log(waited);
        },
      },
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

    this.runTasks(this.setups);
  }
}

export = Mynewcli;
