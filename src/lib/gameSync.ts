import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface StudentGameData {
  nickname: string;
  stage: number;
  score: number;
  coins: number;
  inventory: string[];
  treesPlanted: number;
  temperature: number;
  co2: number;
  badge: string;
  certificateNo: string;
  completed: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface HallOfFameItem {
  id: string;
  nickname: string;
  stage: number;
  score: number;
  treesPlanted: number;
  coins: number;
  badge: string;
  certificateNo: string;
  completed: boolean;
  updatedAt: string;
  createdAt: string;
}

const LOCAL_STORAGE_PREFIX = 'eco_hero_record_';

// Convert nickname to safe ASCII document ID matching ^[a-zA-Z0-9_\-]+$
export function getDocIdForNickname(nickname: string): string {
  const clean = nickname.trim();
  if (!clean) return 'guest_student';
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(clean);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return `stu_${hex}`.slice(0, 100);
  } catch {
    return 'stu_' + Math.abs(clean.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  }
}

// Generate unique certificate ID
export function generateCertificateNo(nickname: string): string {
  const clean = nickname.trim().toUpperCase() || 'HERO';
  const year = new Date().getFullYear();
  const hash = Math.abs(clean.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 10000;
  return `ECO-${year}-KR-${String(hash).padStart(4, '0')}`;
}

// Calculate title badge based on stage & score
export function getHonorBadge(stage: number, score: number): string {
  if (stage >= 50 || score >= 20000) return '지구 수호 마스터 (Master)';
  if (stage >= 20 || score >= 10000) return '청정 지구 사령관 (Commander)';
  if (stage >= 10 || score >= 5000) return '빙하 구조대장 (Glacier Hero)';
  if (stage >= 5 || score >= 2000) return '푸른 숲 가디언 (Forest Guardian)';
  return '새싹 수호자 (Eco Seed)';
}

// Fetch single student record by nickname
export async function fetchStudentRecordByNickname(nickname: string): Promise<StudentGameData | null> {
  const cleanNick = nickname.trim();
  if (!cleanNick) return null;
  const docId = getDocIdForNickname(cleanNick);

  try {
    const docRef = doc(db, 'hall_of_fame', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StudentGameData;
      localStorage.setItem(LOCAL_STORAGE_PREFIX + cleanNick, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `hall_of_fame/${docId}`);
  }

  // Fallback to local storage
  const cached = localStorage.getItem(LOCAL_STORAGE_PREFIX + cleanNick);
  if (cached) {
    try {
      return JSON.parse(cached) as StudentGameData;
    } catch {
      return null;
    }
  }

  return null;
}

// Save or update student record in Hall of Fame
export async function saveStudentRecord(data: StudentGameData): Promise<boolean> {
  const cleanNick = data.nickname.trim();
  if (!cleanNick) return false;
  const docId = getDocIdForNickname(cleanNick);

  const payload: StudentGameData = {
    ...data,
    nickname: cleanNick,
    badge: getHonorBadge(data.stage, data.score),
    certificateNo: data.certificateNo || generateCertificateNo(cleanNick),
    updatedAt: new Date().toISOString(),
  };

  // Immediate local persistence
  localStorage.setItem(LOCAL_STORAGE_PREFIX + cleanNick, JSON.stringify(payload));

  try {
    const docRef = doc(db, 'hall_of_fame', docId);
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `hall_of_fame/${docId}`);
    return false;
  }
}

// Subscribe to real-time Hall of Fame rankings
export function subscribeHallOfFameList(
  onUpdate: (items: HallOfFameItem[]) => void
): () => void {
  try {
    const colRef = collection(db, 'hall_of_fame');
    const q = query(colRef, limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: HallOfFameItem[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as StudentGameData;
          list.push({
            id: d.id,
            nickname: item.nickname || '익명 용사',
            stage: item.stage || 1,
            score: item.score || 0,
            treesPlanted: item.treesPlanted || 0,
            coins: item.coins || 0,
            badge: item.badge || getHonorBadge(item.stage || 1, item.score || 0),
            certificateNo: item.certificateNo || generateCertificateNo(item.nickname || ''),
            completed: Boolean(item.completed || item.stage >= 5),
            updatedAt: item.updatedAt || new Date().toISOString(),
            createdAt: item.createdAt || new Date().toISOString(),
          });
        });

        // Sort descending by score, then stage
        list.sort((a, b) => b.score - a.score || b.stage - a.stage);
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'hall_of_fame');
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to subscribe Hall of Fame:', error);
    return () => {};
  }
}

// One-off fetch for Hall of Fame
export async function fetchHallOfFameList(): Promise<HallOfFameItem[]> {
  try {
    const colRef = collection(db, 'hall_of_fame');
    const q = query(colRef, limit(50));
    const snap = await getDocs(q);
    const list: HallOfFameItem[] = [];
    snap.forEach((d) => {
      const item = d.data() as StudentGameData;
      list.push({
        id: d.id,
        nickname: item.nickname || '익명 용사',
        stage: item.stage || 1,
        score: item.score || 0,
        treesPlanted: item.treesPlanted || 0,
        coins: item.coins || 0,
        badge: item.badge || getHonorBadge(item.stage || 1, item.score || 0),
        certificateNo: item.certificateNo || generateCertificateNo(item.nickname || ''),
        completed: Boolean(item.completed || item.stage >= 5),
        updatedAt: item.updatedAt || new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
      });
    });

    list.sort((a, b) => b.score - a.score || b.stage - a.stage);
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'hall_of_fame');
    return [];
  }
}
