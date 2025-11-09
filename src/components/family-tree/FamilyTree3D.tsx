import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Person {
  firstName: string;
  lastName: string;
  maidenName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  documents?: {
    birthCertificate?: boolean;
    marriageCertificate?: boolean;
    passport?: boolean;
  };
}

interface PersonNode {
  person?: Person;
  position: [number, number, number];
  label: string;
  generation: number;
  isPolish?: boolean;
}

interface FamilyTree3DProps {
  clientData: Person & { sex?: string };
  spouse?: Person;
  father?: Person;
  mother?: Person;
  paternalGrandfather?: Person;
  paternalGrandmother?: Person;
  maternalGrandfather?: Person;
  maternalGrandmother?: Person;
  paternalGreatGrandfather?: Person;
  paternalGreatGrandmother?: Person;
  maternalGreatGrandfather?: Person;
  maternalGreatGrandmother?: Person;
  onNodeClick?: (personType: string) => void;
}

// 3D Person Card
function PersonCard3D({ 
  node, 
  onClick,
  highlight = false 
}: { 
  node: PersonNode; 
  onClick?: () => void;
  highlight?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime + node.position[0]) * 0.1;
      
      // Slight rotation on hover
      if (hovered) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  const hasData = node.person?.firstName && node.person?.lastName;
  const docs = node.person?.documents || {};
  const completedDocs = Object.values(docs).filter(Boolean).length;
  const totalDocs = 3;

  // Colors based on generation
  const getColor = () => {
    if (highlight) return '#ef4444'; // Red for Polish bloodline
    if (!hasData) return '#444444';
    switch (node.generation) {
      case 4: return '#8b5cf6'; // Purple for great-grandparents
      case 3: return '#3b82f6'; // Blue for grandparents
      case 2: return '#06b6d4'; // Cyan for parents
      case 1: return '#10b981'; // Green for client/spouse
      default: return '#6b7280';
    }
  };

  return (
    <group position={node.position}>
      {/* Card mesh */}
      <Box
        ref={meshRef}
        args={[2, 1.5, 0.2]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {/* Glass overlay for hover effect */}
      {hovered && (
        <Box args={[2.1, 1.6, 0.21]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            metalness={1}
            roughness={0}
            clearcoat={1}
          />
        </Box>
      )}

      {/* Text label */}
      <Text
        position={[0, 0.3, 0.15]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {node.label}
      </Text>

      {hasData && (
        <>
          <Text
            position={[0, 0, 0.15]}
            fontSize={0.12}
            color="#e0e0e0"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {node.person?.firstName} {node.person?.lastName}
          </Text>

          {node.person?.dateOfBirth && (
            <Text
              position={[0, -0.25, 0.15]}
              fontSize={0.08}
              color="#a0a0a0"
              anchorX="center"
              anchorY="middle"
            >
              {new Date(node.person.dateOfBirth).toLocaleDateString()}
            </Text>
          )}

          {/* Completion indicator spheres */}
          <group position={[0, -0.5, 0.15]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[(i - 1) * 0.3, 0, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                  color={i < completedDocs ? '#10b981' : '#ef4444'}
                  emissive={i < completedDocs ? '#10b981' : '#ef4444'}
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
          </group>
        </>
      )}

      {/* Polish flag indicator */}
      {highlight && (
        <mesh position={[0.9, 0.6, 0.15]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {/* Interactive HTML overlay on hover */}
      {hovered && hasData && (
        <Html
          position={[0, 0, 0.2]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-2xl min-w-[200px]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  {node.person?.firstName} {node.person?.lastName}
                </p>
                <Badge variant={completedDocs === totalDocs ? "default" : "destructive"} className="text-xs">
                  {completedDocs}/{totalDocs}
                </Badge>
              </div>
              
              {node.person?.placeOfBirth && (
                <p className="text-xs text-muted-foreground">
                  📍 {node.person.placeOfBirth}
                </p>
              )}

              <div className="flex gap-2 mt-2">
                {docs.birthCertificate ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
                {docs.marriageCertificate ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                )}
                {docs.passport ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
              </div>
            </div>
          </motion.div>
        </Html>
      )}
    </group>
  );
}

// Connection line between nodes
function ConnectionLine({ start, end, highlight = false }: { 
  start: [number, number, number]; 
  end: [number, number, number];
  highlight?: boolean;
}) {
  const points = [new Vector3(...start), new Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={highlight ? "#ef4444" : "#4b5563"}
      lineWidth={highlight ? 3 : 1}
      transparent
      opacity={highlight ? 0.8 : 0.3}
    />
  );
}

export function FamilyTree3D({
  clientData,
  spouse,
  father,
  mother,
  paternalGrandfather,
  paternalGrandmother,
  maternalGrandfather,
  maternalGrandmother,
  paternalGreatGrandfather,
  paternalGreatGrandmother,
  maternalGreatGrandfather,
  maternalGreatGrandmother,
  onNodeClick
}: FamilyTree3DProps) {
  const [highlightBloodline, setHighlightBloodline] = useState(false);

  // Define positions for each family member
  const nodes: (PersonNode & { type: string })[] = [
    // Generation 4: Great Grandparents (top layer, furthest back)
    {
      person: paternalGreatGrandfather,
      position: [-6, 6, -4],
      label: 'Paternal Great Grandfather',
      generation: 4,
      type: 'paternalGreatGrandfather',
      isPolish: true
    },
    {
      person: paternalGreatGrandmother,
      position: [-3, 6, -4],
      label: 'Paternal Great Grandmother',
      generation: 4,
      type: 'paternalGreatGrandmother'
    },
    {
      person: maternalGreatGrandfather,
      position: [3, 6, -4],
      label: 'Maternal Great Grandfather',
      generation: 4,
      type: 'maternalGreatGrandfather',
      isPolish: true
    },
    {
      person: maternalGreatGrandmother,
      position: [6, 6, -4],
      label: 'Maternal Great Grandmother',
      generation: 4,
      type: 'maternalGreatGrandmother'
    },

    // Generation 3: Grandparents (middle-back layer)
    {
      person: paternalGrandfather,
      position: [-4.5, 3, -2],
      label: 'Paternal Grandfather',
      generation: 3,
      type: 'paternalGrandfather'
    },
    {
      person: paternalGrandmother,
      position: [-1.5, 3, -2],
      label: 'Paternal Grandmother',
      generation: 3,
      type: 'paternalGrandmother'
    },
    {
      person: maternalGrandfather,
      position: [1.5, 3, -2],
      label: 'Maternal Grandfather',
      generation: 3,
      type: 'maternalGrandfather'
    },
    {
      person: maternalGrandmother,
      position: [4.5, 3, -2],
      label: 'Maternal Grandmother',
      generation: 3,
      type: 'maternalGrandmother'
    },

    // Generation 2: Parents (middle layer)
    {
      person: father,
      position: [-2, 0, 0],
      label: 'Father',
      generation: 2,
      type: 'father'
    },
    {
      person: mother,
      position: [2, 0, 0],
      label: 'Mother',
      generation: 2,
      type: 'mother'
    },

    // Generation 1: Client & Spouse (front layer)
    {
      person: clientData,
      position: [-1.5, -3, 2],
      label: clientData.sex === 'M' ? 'Male Applicant' : clientData.sex === 'F' ? 'Female Applicant' : 'Applicant',
      generation: 1,
      type: 'client'
    },
    {
      person: spouse,
      position: [1.5, -3, 2],
      label: 'Spouse',
      generation: 1,
      type: 'spouse'
    },
  ];

  // Define connections (family relationships)
  const connections: Array<{ start: string; end: string; isBloodline?: boolean }> = [
    // Great grandparents to grandparents
    { start: 'paternalGreatGrandfather', end: 'paternalGrandfather', isBloodline: true },
    { start: 'paternalGreatGrandmother', end: 'paternalGrandfather' },
    { start: 'maternalGreatGrandfather', end: 'maternalGrandfather', isBloodline: true },
    { start: 'maternalGreatGrandmother', end: 'maternalGrandmother' },

    // Grandparents to parents
    { start: 'paternalGrandfather', end: 'father' },
    { start: 'paternalGrandmother', end: 'father' },
    { start: 'maternalGrandfather', end: 'mother' },
    { start: 'maternalGrandmother', end: 'mother' },

    // Parents to client
    { start: 'father', end: 'client' },
    { start: 'mother', end: 'client' },

    // Client to spouse
    { start: 'client', end: 'spouse' },
  ];

  const getNodePosition = (type: string): [number, number, number] => {
    const node = nodes.find(n => n.type === type);
    return node?.position || [0, 0, 0];
  };

  return (
    <div className="w-full h-[800px] bg-gradient-to-b from-background to-muted/20 rounded-xl overflow-hidden border border-border">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4b5563" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />

        {/* Stars background */}
        <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[50, 32, 32]} />
          <meshBasicMaterial color="#0a0a0a" side={THREE.BackSide} />
        </mesh>

        {/* Connection lines */}
        {connections.map((conn, i) => (
          <ConnectionLine
            key={i}
            start={getNodePosition(conn.start)}
            end={getNodePosition(conn.end)}
            highlight={highlightBloodline && conn.isBloodline}
          />
        ))}

        {/* Person cards */}
        {nodes.map((node) => (
          <PersonCard3D
            key={node.type}
            node={node}
            onClick={() => onNodeClick?.(node.type)}
            highlight={highlightBloodline && node.isPolish}
          />
        ))}

        {/* Generation labels */}
        <Text position={[0, 7, -4]} fontSize={0.3} color="#8b5cf6" anchorX="center">
          4th Generation
        </Text>
        <Text position={[0, 4, -2]} fontSize={0.3} color="#3b82f6" anchorX="center">
          3rd Generation
        </Text>
        <Text position={[0, 1, 0]} fontSize={0.3} color="#06b6d4" anchorX="center">
          2nd Generation
        </Text>
        <Text position={[0, -2, 2]} fontSize={0.3} color="#10b981" anchorX="center">
          1st Generation
        </Text>

        {/* Orbit controls for rotation */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={30}
          autoRotate={!highlightBloodline}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 text-xs text-muted-foreground">
          <p>🖱️ Drag to rotate • Scroll to zoom • Click cards to edit</p>
        </div>
        
        <button
          onClick={() => setHighlightBloodline(!highlightBloodline)}
          className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-sm font-medium hover:bg-background transition-colors"
        >
          {highlightBloodline ? '✨ Hide' : '🇵🇱 Show'} Polish Bloodline
        </button>
      </div>
    </div>
  );
}
