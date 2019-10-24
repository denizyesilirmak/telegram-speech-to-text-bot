async function main() {


    const fileName = './resources/yihit.ogg';

    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');
  

    const audio = {
      content: audioBytes,
    };

  }
  main().catch(console.error);