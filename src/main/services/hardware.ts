import { SerialPort } from "serialport";

class HardwareService {
  private printerPort: SerialPort | null = null;
  private isInitialized = false;

  async scanPrinterDevices(): Promise<{ path: string; manufacturer?: string; serialNumber?: string }[]> {
    try {
      const ports = await SerialPort.list();
      return ports
        .filter((p) => p.vendorId || p.manufacturer)
        .map((p) => ({
          path: p.path,
          manufacturer: p.manufacturer,
          serialNumber: p.serialNumber,
        }));
    } catch {
      return [];
    }
  }

  async connectPrinter(devicePath: string): Promise<boolean> {
    try {
      if (this.printerPort?.isOpen) {
        this.printerPort.close();
      }
      this.printerPort = new SerialPort({ path: devicePath, baudRate: 19200 });
      this.isInitialized = true;
      return true;
    } catch {
      this.isInitialized = false;
      return false;
    }
  }

  async printReceipt(lines: string[]): Promise<{ success: boolean; error?: string }> {
    if (!this.printerPort || !this.printerPort.isOpen) {
      return { success: false, error: "Printer not connected" };
    }

    try {
      const encoder = new TextEncoder();
      const chunks: Buffer[] = [];

      // ESC/POS init
      chunks.push(Buffer.from([0x1b, 0x40]));
      // Center align
      chunks.push(Buffer.from([0x1b, 0x61, 0x01]));

      for (const line of lines) {
        chunks.push(Buffer.from(line + "\n"));
      }

      // Cut paper
      chunks.push(Buffer.from([0x1d, 0x56, 0x41, 0x10]));

      const data = Buffer.concat(chunks);
      this.printerPort.write(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async kickDrawer(): Promise<{ success: boolean; error?: string }> {
    if (!this.printerPort || !this.printerPort.isOpen) {
      return { success: false, error: "Printer not connected (drawer triggered via printer DK port)" };
    }

    try {
      // ESC/POS cash drawer kick (pin 2)
      this.printerPort.write(Buffer.from([0x1b, 0x70, 0x00, 0x3c, 0xff]));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  cleanup(): void {
    if (this.printerPort?.isOpen) {
      this.printerPort.close();
    }
  }
}

export const hardwareService = new HardwareService();
