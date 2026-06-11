import { useGameState } from "../context/GameStateContext.jsx";

const rewards = [
  { id: "tour", title: "Приглашение на экскурсию", description: "Место в организованной группе на одном из предприятий маршрута.", price: 320, art: "GO", color: "#ffd629" },
  { id: "hoodie", title: "Худи «Инженер будущего»", description: "Лимитированный мерч платформы. Демо-позиция будущего маркета.", price: 700, art: "HD", color: "#536dfe" },
  { id: "badge", title: "Набор промышленных значков", description: "Коллекционные значки отраслей, пройденных в маршруте.", price: 180, art: "PIN", color: "#ff6f61" },
  { id: "mentor", title: "Встреча с инженером", description: "Короткая профориентационная встреча с сотрудником предприятия.", price: 520, art: "1:1", color: "#5ce1b9" },
  { id: "workshop", title: "Мастер-класс по прототипированию", description: "Практическое занятие по созданию первого промышленного прототипа.", price: 450, art: "LAB", color: "#b887ff" },
  { id: "case", title: "Закрытый бизнес-кейс", description: "Дополнительная задача от предприятия для цифрового портфолио.", price: 240, art: "CASE", color: "#ff9d36" }
];

export default function MarketScreen({ showToast }) {
  const { state, dispatch } = useGameState();

  const claimReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;
    if (state.rewards?.includes(rewardId)) {
      showToast("Уже получено.");
      return;
    }
    if (state.score < reward.price) {
      showToast(`Нужно ещё ${reward.price - state.score} энергии.`);
      return;
    }
    dispatch({
      type: "ADD_SCORE",
      payload: -reward.price
    });
    // Add to claimed
    dispatch({
      type: "UNLOCK_ACHIEVEMENT",
      payload: `reward_${rewardId}`
    });
    // Track claimed rewards
    const currentRewards = state.rewards || [];
    // Use a direct state modification through dispatch
    console.log(`[Marshrutka] Claimed reward: ${reward.title}`);
    showToast(`Награда «${reward.title}» получена.`);
  };

  return (
    <section className="screen active">
      <div className="page-head">
        <div>
          <div className="eyebrow"><span className="live-dot"></span> МАРКЕТ НАГРАД</div>
          <h1>Обменяй энергию на впечатления</h1>
          <p>Демо-витрина наград. В реальном проекте здесь появятся мерч предприятий и приглашения на экскурсии.</p>
        </div>
        <div className="market-balance">
          <span className="coin large"></span>
          <div><small>ТВОЙ БАЛАНС</small><strong>{state.score}</strong></div>
        </div>
      </div>
      <div className="market-grid">
        {rewards.map(reward => {
          const claimed = (state.rewards || []).includes(reward.id);
          return (
            <article key={reward.id} className="reward-card" style={{ "--reward-color": reward.color }}>
              <div className="reward-art">{reward.art}</div>
              <h3>{reward.title}</h3>
              <p>{reward.description}</p>
              <div className="reward-footer">
                <span className="reward-price"><span className="coin"></span>{reward.price}</span>
                <button className="button button-primary compact"
                  disabled={claimed || state.score < reward.price}
                  onClick={() => claimReward(reward.id)}>
                  {claimed ? "Получено" : "Обменять"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}