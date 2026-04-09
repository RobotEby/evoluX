import { Exercise } from '../model/workout';

export const EXERCISES: Exercise[] = [
  {
    id: 'ex-01',
    name: 'Supino Reto com Barra',
    muscleGroups: ['peito', 'triceps', 'ombros'],
    equipment: 'Barra',
  },
  {
    id: 'ex-02',
    name: 'Supino Inclinado com Halteres',
    muscleGroups: ['peito', 'triceps', 'ombros'],
    equipment: 'Halteres',
  },
  { id: 'ex-03', name: 'Supino Declinado', muscleGroups: ['peito', 'triceps'], equipment: 'Barra' },
  { id: 'ex-04', name: 'Crucifixo com Halteres', muscleGroups: ['peito'], equipment: 'Halteres' },
  { id: 'ex-05', name: 'Crossover', muscleGroups: ['peito'], equipment: 'Cabo' },
  {
    id: 'ex-06',
    name: 'Flexão de Braço',
    muscleGroups: ['peito', 'triceps'],
    equipment: 'Peso Corporal',
  },

  { id: 'ex-07', name: 'Barra Fixa', muscleGroups: ['costas', 'biceps'], equipment: 'Barra Fixa' },
  { id: 'ex-08', name: 'Remada Curvada', muscleGroups: ['costas', 'biceps'], equipment: 'Barra' },
  { id: 'ex-09', name: 'Puxada Frontal', muscleGroups: ['costas', 'biceps'], equipment: 'Cabo' },
  {
    id: 'ex-10',
    name: 'Remada Unilateral',
    muscleGroups: ['costas', 'biceps'],
    equipment: 'Halter',
  },
  { id: 'ex-11', name: 'Remada Cavaleiro', muscleGroups: ['costas'], equipment: 'Máquina' },
  { id: 'ex-12', name: 'Pullover', muscleGroups: ['costas', 'peito'], equipment: 'Halter' },

  {
    id: 'ex-13',
    name: 'Desenvolvimento com Halteres',
    muscleGroups: ['ombros', 'triceps'],
    equipment: 'Halteres',
  },
  { id: 'ex-14', name: 'Elevação Lateral', muscleGroups: ['ombros'], equipment: 'Halteres' },
  { id: 'ex-15', name: 'Elevação Frontal', muscleGroups: ['ombros'], equipment: 'Halteres' },
  { id: 'ex-16', name: 'Face Pull', muscleGroups: ['ombros', 'trapezio'], equipment: 'Cabo' },
  {
    id: 'ex-17',
    name: 'Desenvolvimento Militar',
    muscleGroups: ['ombros', 'triceps'],
    equipment: 'Barra',
  },

  { id: 'ex-18', name: 'Rosca Direta', muscleGroups: ['biceps'], equipment: 'Barra' },
  { id: 'ex-19', name: 'Rosca Alternada', muscleGroups: ['biceps'], equipment: 'Halteres' },
  {
    id: 'ex-20',
    name: 'Rosca Martelo',
    muscleGroups: ['biceps', 'antebracos'],
    equipment: 'Halteres',
  },
  { id: 'ex-21', name: 'Rosca Scott', muscleGroups: ['biceps'], equipment: 'Barra EZ' },
  { id: 'ex-22', name: 'Rosca Concentrada', muscleGroups: ['biceps'], equipment: 'Halter' },

  { id: 'ex-23', name: 'Tríceps Pulley', muscleGroups: ['triceps'], equipment: 'Cabo' },
  { id: 'ex-24', name: 'Tríceps Testa', muscleGroups: ['triceps'], equipment: 'Barra EZ' },
  { id: 'ex-25', name: 'Tríceps Francês', muscleGroups: ['triceps'], equipment: 'Halter' },
  { id: 'ex-26', name: 'Mergulho', muscleGroups: ['triceps', 'peito'], equipment: 'Paralelas' },

  {
    id: 'ex-27',
    name: 'Agachamento Livre',
    muscleGroups: ['quadriceps', 'gluteos'],
    equipment: 'Barra',
  },
  {
    id: 'ex-28',
    name: 'Leg Press 45°',
    muscleGroups: ['quadriceps', 'gluteos'],
    equipment: 'Máquina',
  },
  { id: 'ex-29', name: 'Hack Squat', muscleGroups: ['quadriceps'], equipment: 'Máquina' },
  { id: 'ex-30', name: 'Cadeira Extensora', muscleGroups: ['quadriceps'], equipment: 'Máquina' },
  {
    id: 'ex-31',
    name: 'Agachamento Búlgaro',
    muscleGroups: ['quadriceps', 'gluteos'],
    equipment: 'Halteres',
  },
  { id: 'ex-32', name: 'Passada', muscleGroups: ['quadriceps', 'gluteos'], equipment: 'Halteres' },

  { id: 'ex-33', name: 'Stiff', muscleGroups: ['posteriores', 'gluteos'], equipment: 'Barra' },
  { id: 'ex-34', name: 'Mesa Flexora', muscleGroups: ['posteriores'], equipment: 'Máquina' },
  { id: 'ex-35', name: 'Cadeira Flexora', muscleGroups: ['posteriores'], equipment: 'Máquina' },
  {
    id: 'ex-36',
    name: 'Levantamento Terra',
    muscleGroups: ['posteriores', 'costas', 'gluteos'],
    equipment: 'Barra',
  },

  { id: 'ex-37', name: 'Hip Thrust', muscleGroups: ['gluteos'], equipment: 'Barra' },
  { id: 'ex-38', name: 'Elevação Pélvica', muscleGroups: ['gluteos'], equipment: 'Peso Corporal' },

  { id: 'ex-39', name: 'Panturrilha em Pé', muscleGroups: ['panturrilhas'], equipment: 'Máquina' },
  {
    id: 'ex-40',
    name: 'Panturrilha Sentado',
    muscleGroups: ['panturrilhas'],
    equipment: 'Máquina',
  },

  { id: 'ex-41', name: 'Abdominal Crunch', muscleGroups: ['abdomen'], equipment: 'Peso Corporal' },
  { id: 'ex-42', name: 'Prancha', muscleGroups: ['abdomen'], equipment: 'Peso Corporal' },
  {
    id: 'ex-43',
    name: 'Elevação de Pernas',
    muscleGroups: ['abdomen'],
    equipment: 'Peso Corporal',
  },
  { id: 'ex-44', name: 'Abdominal na Polia', muscleGroups: ['abdomen'], equipment: 'Cabo' },

  { id: 'ex-45', name: 'Encolhimento com Barra', muscleGroups: ['trapezio'], equipment: 'Barra' },
  {
    id: 'ex-46',
    name: 'Encolhimento com Halteres',
    muscleGroups: ['trapezio'],
    equipment: 'Halteres',
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getExercisesByMuscle(muscle: string): Exercise[] {
  return EXERCISES.filter((e) => e.muscleGroups.includes(muscle as any));
}
