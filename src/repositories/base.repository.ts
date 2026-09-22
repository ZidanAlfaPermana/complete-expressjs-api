import {Entity} from "../types";

export class Repository<T extends Entity> {
    protected items: T[] = [];
    protected nextId: number = 1;

    create(data: Omit<T, "id">): T {
        const newItem = { ...data, id: this.nextId++ } as T;
        this.items.push(newItem);
        return newItem;
    }

    findById(id: number): T | undefined {
        return this.items.find((item) => item.id === id);
    }

    findAll(): T[] {
        return [...this.items];
    }

    update(id: number, data: Partial<T>): T | undefined {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) return undefined;

        this.items[index] = { ...this.items[index], ...data } as T;
        return this.items[index];
    }

    delete(id: number): boolean {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) return false;

        this.items.splice(index, 1);
        return true;
    }

    count(): number {
        return this.items.length;
    }
}