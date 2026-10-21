// tests/helpers/mockRepo.ts
// Sengaja diketik longgar (jest.Mock) supaya mudah dipakai. Kompromi: kita kehilangan
// sedikit pengecekan tipe di mock, tapi test jauh lebih ringkas.
export type MockRepo = Record<
    "find" | "findOne" | "findOneBy" | "findAndCount" | "create" | "save" | "merge" | "delete",
    jest.Mock
>;

export function buatMockRepo(): MockRepo {
    return {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        findAndCount: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        merge: jest.fn(),
        delete: jest.fn(),
    };
}