export interface Repository<TEntity extends { readonly id: string }> {
	all(): readonly TEntity[];
	find(id: string): TEntity | undefined;
	findBy(predicate: (entity: TEntity) => boolean): TEntity | undefined;
	create(entity: TEntity): TEntity;
	update(id: string, entity: TEntity): TEntity | undefined;
	delete(id: string): boolean;
	clear(): void;
}

export class MemoryRepository<TEntity extends { readonly id: string }>
	implements Repository<TEntity>
{
	readonly #records = new Map<string, TEntity>();

	all(): readonly TEntity[] {
		return Array.from(this.#records.values());
	}

	find(id: string): TEntity | undefined {
		return this.#records.get(id);
	}

	findBy(predicate: (entity: TEntity) => boolean): TEntity | undefined {
		return this.all().find(predicate);
	}

	create(entity: TEntity): TEntity {
		this.#records.set(entity.id, entity);
		return entity;
	}

	update(id: string, entity: TEntity): TEntity | undefined {
		if (!this.#records.has(id)) {
			return undefined;
		}

		this.#records.set(id, entity);
		return entity;
	}

	delete(id: string): boolean {
		return this.#records.delete(id);
	}

	clear(): void {
		this.#records.clear();
	}
}
