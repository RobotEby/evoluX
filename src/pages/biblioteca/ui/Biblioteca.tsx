import { useState, useEffect } from 'react';
import { BookOpen, Heart, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Button } from '@/shared/ui/ui/button';
import { Badge } from '@/shared/ui/ui/badge';
import { Input } from '@/shared/ui/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/ui/select';
import { getVideos, toggleFavorite } from '@/shared/lib/storage';
import type { ContentVideo } from '@/entities/workout/model/workout';
import {
  TECHNIQUE_LABELS,
  MUSCLE_GROUP_LABELS,
  type Technique,
  type MuscleGroup,
} from '@/entities/workout/model/workout';
import { cn } from '@/shared/lib/utils';

export default function Biblioteca() {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [search, setSearch] = useState('');
  const [filterTechnique, setFilterTechnique] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    setVideos(getVideos());
  }, []);

  const handleFavorite = (id: string) => {
    toggleFavorite(id);
    setVideos(getVideos());
  };

  const creators = [...new Set(videos.map((v) => v.creator))];

  const filtered = videos.filter((v) => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTechnique !== 'all' && v.technique !== filterTechnique) return false;
    if (filterCreator !== 'all' && v.creator !== filterCreator) return false;
    if (showFavoritesOnly && !v.isFavorite) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        Biblioteca
      </h1>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vídeos..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterTechnique} onValueChange={setFilterTechnique}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Técnica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas técnicas</SelectItem>
              {Object.entries(TECHNIQUE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCreator} onValueChange={setFilterCreator}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Criador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {creators.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart className={cn('h-3 w-3 mr-1', showFavoritesOnly && 'fill-current')} />
            Favoritos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden hover:border-primary/30 transition-colors"
          >
            <div className="relative aspect-video bg-muted">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => handleFavorite(video.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    video.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                  )}
                />
              </button>
            </div>
            <CardContent className="p-3 space-y-1.5">
              <p className="font-medium text-sm line-clamp-2">{video.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{video.creator}</span>
                {video.technique && (
                  <Badge variant="secondary" className="text-[10px]">
                    {TECHNIQUE_LABELS[video.technique]}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum vídeo encontrado.</p>
        </div>
      )}
    </div>
  );
}
