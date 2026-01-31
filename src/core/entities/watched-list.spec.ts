import { WatchedList } from '@/core/entities/watched-list'

class NumberWatchedList extends WatchedList<number> {
  compareItems(a: number, b: number): boolean {
    return a === b
  }
}

describe('lista monitorada', () => {
  it('deve ser capaz de criar uma lista monitorada com itens iniciais', () => {
    const list = new NumberWatchedList([1, 2, 3])

    expect(list.currentItems).toHaveLength(3)
  })

  it('deve ser capaz de adicionar novos itens à lista', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.add(4)

    expect(list.currentItems).toHaveLength(4)
    expect(list.getNewItems()).toEqual([4])
  })

  it('deve ser capaz de remover itens da lista', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(2)

    expect(list.currentItems).toHaveLength(2)
    expect(list.getRemovedItems()).toEqual([2])
  })

  it('deve ser capaz de adicionar um item mesmo se ele foi removido antes', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(2)
    list.add(2)

    expect(list.currentItems).toHaveLength(3)

    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
  })

  it('deve ser capaz de remover um item mesmo se ele foi adicionado antes', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.add(4)
    list.remove(4)

    expect(list.currentItems).toHaveLength(3)

    expect(list.getRemovedItems()).toEqual([])
    expect(list.getNewItems()).toEqual([])
  })

  it('deve ser capaz de atualizar os itens da lista monitorada', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.update([1, 3, 5])

    expect(list.getRemovedItems()).toEqual([2])
    expect(list.getNewItems()).toEqual([5])
  })
})
