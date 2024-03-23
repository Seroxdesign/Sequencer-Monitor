# Sequencer Monitor

The Sequencer Monitor is a tool designed to track workable jobs on various networks and notify Discord when certain conditions are met.

## Features

- Monitors workable jobs on multiple networks.
- Notifies Discord when specific conditions (e.g., consecutive unworked blocks) are met.

## Usage

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/sequencer-monitor.git
    ```

2. **Install dependencies:**

    ```bash
    cd sequencer-monitor
    pnpm install
    ```

3. **Configure environment variables:**
   
   - Rename the `.env.example` file to `.env`.
   - Update the environment variables with your configuration details, such as API keys and Discord webhook URL.

4. **Start the monitor:**

    ```
        npx tsc
        node .
    ```

## Configuration

- Modify the `constants.js` file to update Sequencer ABI, address, and other constants as needed.
- Update the `utils/notifyDiscord.js` file with your Discord notification logic.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.
When changing anything within the .ts files, make sure to run ```npx tsc``` before running ```node .```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
