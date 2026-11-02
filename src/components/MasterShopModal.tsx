import React from 'react';
import { X, ShoppingBag, Zap, ShieldAlert, Sparkles, Check, Wind, Flame } from 'lucide-react';

export interface ShopItem {
  id: string;
  name: string;
  category: 'weapon' | 'skill';
  price: number;
  description: string;
  icon: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'solar_laser',
    name: '태양광 레이저 건 (Solar Laser)',
    category: 'weapon',
    price: 30,
    description: '빛의 속도로 탄소 매연과 장애물을 즉시 정화하는 강력한 레이저 광선!',
    icon: '⚡',
  },
  {
    id: 'mangrove_shield',
    name: '거대 맹그로브 방파제 (Mangrove Seawall)',
    category: 'skill',
    price: 50,
    description: '해수면 상승 저항력 +40%! 장애물에 부딪혀도 물이 훨씬 덜 차오릅니다.',
    icon: '🛡️',
  },
  {
    id: 'carbon_drone',
    name: '탄소 정화 드론 (Carbon Vacuum Drone)',
    category: 'weapon',
    price: 80,
    description: '영웅 주변을 맴돌며 다가오는 탄소 배출 가스를 자동으로 흡수합니다.',
    icon: '🛸',
  },
  {
    id: 'green_dash',
    name: '에코 대시 부스터 (Eco Dash)',
    category: 'skill',
    price: 60,
    description: '공중에서 2단 점프 및 순식간에 앞으로 돌진하여 위험을 회피합니다.',
    icon: '💨',
  },
  {
    id: 'glacier_cannon',
    name: '빙하 복원 냉각포 (Glacier Cryo-Cannon)',
    category: 'weapon',
    price: 100,
    description: '빙하거인 보스에게 2배의 정화 데미지를 입히는 강력한 극지방 냉각포!',
    icon: '❄️',
  },
];

interface MasterShopModalProps {
  coins: number;
  inventory: string[];
  onBuyItem: (itemId: string, price: number) => void;
  onClose: () => void;
}

export const MasterShopModal: React.FC<MasterShopModalProps> = ({
  coins,
  inventory,
  onBuyItem,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-amber-300 font-['DungGeunMo']">
                🛍️ 마스터 에코 상점 (무기 & 스킬)
              </h2>
              <p className="text-xs text-slate-400">
                기후위기 마스터 레벨 특권: 코인을 모아 지구를 지킬 첨단 에코 장비를 구매하세요!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-800 rounded-xl border border-amber-500/40 text-amber-300 text-sm font-mono font-bold flex items-center gap-1.5">
              <span>🪙</span> {coins} 코인
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-5">
          {SHOP_ITEMS.map((item) => {
            const isOwned = inventory.includes(item.id);
            const canAfford = coins >= item.price;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isOwned
                    ? 'bg-emerald-950/30 border-emerald-500/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700">
                        {item.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 font-['DungGeunMo']">
                          {item.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {item.category === 'weapon' ? '공격 무기' : '방어/기동 스킬'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {isOwned ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> 보유중
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          🪙 {item.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  {isOwned ? (
                    <button
                      disabled
                      className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg cursor-default border border-emerald-500/30"
                    >
                      장착 완료
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyItem(item.id, item.price)}
                      disabled={!canAfford}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition font-['DungGeunMo'] ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '구매 및 장착' : '코인 부족'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400 text-center">
          💡 게임 중 황금 에코 코인을 획득하면 코인이 누적됩니다. Firebase 관리코드를 통해 다른 기기에서도 보유 무기가 유지됩니다!
        </div>
      </div>
    </div>
  );
};
