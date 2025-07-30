import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Download, QrCode, Calendar, Shield } from 'lucide-react';
import { generateQRCode } from '@/utils/qrCodeGenerator';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import easelearnBadge from '@/assets/easelearn-badge.png';
import companyLogoPlaceholder from '@/assets/company-logo-placeholder.png';

export interface CertificateData {
  id: string;
  learnerName: string;
  courseTitle: string;
  completionDate: Date;
  expirationDate?: Date;
  score?: number;
  instructor: string;
  certificateNumber: string;
  qrCodeUrl: string;
  clientId?: string;
  clientName?: string;
  clientLogo?: string;
}

interface CertificateModuleProps {
  initialData?: Partial<CertificateData>;
  onSave?: (data: CertificateData) => void;
  readonly?: boolean;
}

export const CertificateModule: React.FC<CertificateModuleProps> = ({
  initialData,
  onSave,
  readonly = false
}) => {
  const [formData, setFormData] = useState<Partial<CertificateData>>({
    learnerName: '',
    courseTitle: '',
    completionDate: new Date(),
    instructor: 'Jeffrey D Thorn',
    certificateNumber: crypto.randomUUID(),
    ...initialData
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [trainingModules, setTrainingModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch training modules
  useEffect(() => {
    const fetchTrainingModules = async () => {
      setLoadingModules(true);
      try {
        const { data, error } = await supabase
          .from('training_modules')
          .select('id, title, description, status')
          .eq('status', 'published')
          .order('title');

        if (error) {
          console.error('Error fetching training modules:', error);
          toast({
            title: "Error",
            description: "Failed to load training modules",
            variant: "destructive"
          });
        } else {
          setTrainingModules(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error", 
          description: "Failed to load training modules",
          variant: "destructive"
        });
      } finally {
        setLoadingModules(false);
      }
    };

    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, company_name, company_settings_id, company_settings(company_logo_url)')
          .eq('status', 'active')
          .order('company_name');

        if (error) {
          console.error('Error fetching clients:', error);
          toast({
            title: "Error",
            description: "Failed to load clients",
            variant: "destructive"
          });
        } else {
          setClients(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load clients", 
          variant: "destructive"
        });
      } finally {
        setLoadingClients(false);
      }
    };

    if (!readonly) {
      fetchTrainingModules();
      fetchClients();
    }
  }, [toast, readonly]);

  React.useEffect(() => {
    if (formData.certificateNumber) {
      const verificationUrl = `https://easelearn.com/verify?id=${formData.certificateNumber}`;
      generateQRCode(verificationUrl).then(setQrCodeDataUrl);
    }
  }, [formData.certificateNumber]);

  const handleInputChange = (field: keyof CertificateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientId: selectedClient.id,
        clientName: selectedClient.company_name,
        clientLogo: selectedClient.company_settings?.company_logo_url || null
      }));
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      width: 1056, // 11 inches at 96 DPI
      height: 816  // 8.5 inches at 96 DPI
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'letter');
    
    pdf.addImage(imgData, 'PNG', 0, 0, 792, 612);
    pdf.save(`certificate-${formData.learnerName?.replace(/\s+/g, '-')}.pdf`);
  };

  const handleSave = () => {
    if (onSave && formData.learnerName && formData.courseTitle) {
      const certificateData: CertificateData = {
        id: formData.certificateNumber || crypto.randomUUID(),
        learnerName: formData.learnerName,
        courseTitle: formData.courseTitle,
        completionDate: formData.completionDate || new Date(),
        expirationDate: formData.expirationDate,
        score: formData.score,
        instructor: formData.instructor || 'Jeffrey D Thorn',
        certificateNumber: formData.certificateNumber || crypto.randomUUID(),
        qrCodeUrl: `https://easelearn.com/verify?id=${formData.certificateNumber}`
      };
      onSave(certificateData);
    }
  };

  return (
    <div className="space-y-6">
      {!readonly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="learnerName">Learner Name *</Label>
                <Input
                  id="learnerName"
                  value={formData.learnerName || ''}
                  onChange={(e) => handleInputChange('learnerName', e.target.value)}
                  placeholder="Enter learner's full name"
                />
              </div>
              
               <div>
                 <Label htmlFor="courseTitle">Course Title *</Label>
                 <Select 
                   value={formData.courseTitle || ''} 
                   onValueChange={(value) => handleInputChange('courseTitle', value)}
                   disabled={loadingModules}
                 >
                   <SelectTrigger className="w-full">
                     <SelectValue placeholder={loadingModules ? "Loading courses..." : "Select a training course"} />
                   </SelectTrigger>
                   <SelectContent className="bg-white border shadow-lg z-50 max-h-64 overflow-y-auto">
                     {trainingModules.map((module) => (
                       <SelectItem key={module.id} value={module.title}>
                         {module.title}
                       </SelectItem>
                     ))}
                     {trainingModules.length === 0 && !loadingModules && (
                       <SelectItem value="" disabled>
                         No published training modules found
                       </SelectItem>
                     )}
                   </SelectContent>
                 </Select>
                </div>
               
               <div>
                 <Label htmlFor="clientSelect">Client</Label>
                 <Select 
                   value={formData.clientId || ''} 
                   onValueChange={handleClientChange}
                   disabled={loadingClients}
                 >
                   <SelectTrigger className="w-full">
                     <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client company"} />
                   </SelectTrigger>
                   <SelectContent className="bg-white border shadow-lg z-50 max-h-64 overflow-y-auto">
                     {clients.map((client) => (
                       <SelectItem key={client.id} value={client.id}>
                         {client.company_name}
                       </SelectItem>
                     ))}
                     {clients.length === 0 && !loadingClients && (
                       <SelectItem value="" disabled>
                         No active clients found
                       </SelectItem>
                     )}
                   </SelectContent>
                 </Select>
               </div>
              
              <div>
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input
                  id="completionDate"
                  type="date"
                  value={formData.completionDate ? format(formData.completionDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleInputChange('completionDate', new Date(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate ? format(formData.expirationDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleInputChange('expirationDate', e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="score">Score (Optional)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score || ''}
                  onChange={(e) => handleInputChange('score', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Enter score percentage"
                />
              </div>
              
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor || ''}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  placeholder="Instructor name"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!formData.learnerName || !formData.courseTitle}>
                <Award className="h-4 w-4 mr-2" />
                Generate Certificate
              </Button>
              <Button variant="outline" onClick={downloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={certificateRef}
            className="bg-white text-center relative mx-auto overflow-hidden"
            style={{ 
              width: '8.5in',
              height: '11in',
              maxWidth: '100%',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 20%, #f1f5f9 100%)',
              border: '12px solid',
              borderImage: 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--primary-glow))) 1'
            }}
          >
            {/* Ornate decorative border */}
            <div className="absolute inset-6 border-4 border-primary/30 rounded-lg"></div>
            <div className="absolute inset-8 border-2 border-primary/20 rounded-lg"></div>
            
            {/* EaseLearn Logo - Left Side - Moved down and made bigger */}
            <div className="absolute top-14 left-14">
              <img 
                src="https://40048518.fs1.hubspotusercontent-na1.net/hubfs/40048518/easelearn_logo_052025.png"
                alt="EaseLearn Logo" 
                className="w-32 h-20 object-contain"
                onError={(e) => {
                  // Fallback to generated badge if URL fails to load
                  e.currentTarget.src = easelearnBadge;
                }}
              />
            </div>
            
            {/* Company Logo - Right Side */}
            <div className="absolute top-8 right-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-lg bg-white shadow-lg border-2 border-primary/20 flex items-center justify-center mb-2">
                  <img 
                    src={formData.clientLogo || companyLogoPlaceholder} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = companyLogoPlaceholder;
                    }}
                  />
                </div>
                <h2 className="text-xs font-semibold text-muted-foreground tracking-wide">
                  {formData.clientName || 'COMPANY'}
                </h2>
              </div>
            </div>
            
            {/* Certificate Header with Training Info */}
            <div className="pt-32 px-12 pb-12">
              {/* Training Module Badge */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-primary to-primary-glow px-6 py-2 rounded-full">
                  <span className="text-white font-semibold text-sm tracking-wide">
                    {formData.courseTitle}
                  </span>
                </div>
              </div>

              {/* Professional Certificate Seal */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  {/* Certificate Seal - Starburst Design */}
                  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                    {/* Starburst outer rays */}
                    <g>
                      {Array.from({ length: 36 }).map((_, i) => (
                        <polygon
                          key={i}
                          points="100,100 102,15 104,100"
                          fill="url(#starburstGradient)"
                          stroke="#8B4513"
                          strokeWidth="0.3"
                          transform={`rotate(${i * 10} 100 100)`}
                        />
                      ))}
                    </g>
                    
                    {/* Main circular body */}
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="70" 
                      fill="url(#mainGoldGradient)" 
                      stroke="#654321" 
                      strokeWidth="2"
                    />
                    
                    {/* Inner decorative circle */}
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="62" 
                      fill="none" 
                      stroke="#8B4513" 
                      strokeWidth="1"
                    />
                    
                    {/* Star border pattern */}
                    <g>
                      {Array.from({ length: 20 }).map((_, i) => {
                        const angle = (i * 18) * (Math.PI / 180);
                        const x = 100 + 55 * Math.cos(angle);
                        const y = 100 + 55 * Math.sin(angle);
                        return (
                          <g key={i} transform={`translate(${x},${y}) rotate(${i * 18})`}>
                            <polygon
                              points="0,-3 1,-1 3,0 1,1 0,3 -1,1 -3,0 -1,-1"
                              fill="#654321"
                            />
                          </g>
                        );
                      })}
                    </g>
                    
                    {/* Center content area */}
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="42" 
                      fill="url(#centerAreaGradient)" 
                      stroke="#654321" 
                      strokeWidth="1.5"
                    />
                    
                    {/* Text: CERTIFICATE */}
                    <text 
                      x="100" 
                      y="80" 
                      textAnchor="middle" 
                      fill="#2C2C2C" 
                      fontSize="12" 
                      fontWeight="bold" 
                      fontFamily="serif"
                      letterSpacing="1px"
                    >
                      CERTIFICATE
                    </text>
                    
                    {/* Decorative line */}
                    <line 
                      x1="75" 
                      y1="92" 
                      x2="125" 
                      y2="92" 
                      stroke="#654321" 
                      strokeWidth="1"
                    />
                    
                    {/* Text: OF */}
                    <text 
                      x="100" 
                      y="104" 
                      textAnchor="middle" 
                      fill="#2C2C2C" 
                      fontSize="10" 
                      fontWeight="bold" 
                      fontFamily="serif"
                      letterSpacing="2px"
                    >
                      OF
                    </text>
                    
                    {/* Decorative line */}
                    <line 
                      x1="75" 
                      y1="108" 
                      x2="125" 
                      y2="108" 
                      stroke="#654321" 
                      strokeWidth="1"
                    />
                    
                    {/* Text: COMPLETION */}
                    <text 
                      x="100" 
                      y="122" 
                      textAnchor="middle" 
                      fill="#2C2C2C" 
                      fontSize="12" 
                      fontWeight="bold" 
                      fontFamily="serif"
                      letterSpacing="1px"
                    >
                      COMPLETION
                    </text>
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="starburstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#DAA520" />
                        <stop offset="100%" stopColor="#B8860B" />
                      </linearGradient>
                      <radialGradient id="mainGoldGradient" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="40%" stopColor="#FFC125" />
                        <stop offset="80%" stopColor="#DAA520" />
                        <stop offset="100%" stopColor="#B8860B" />
                      </radialGradient>
                      <radialGradient id="centerAreaGradient" cx="50%" cy="20%">
                        <stop offset="0%" stopColor="#FFFACD" />
                        <stop offset="50%" stopColor="#F5DEB3" />
                        <stop offset="100%" stopColor="#DEB887" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Training Details */}
              <div className="flex justify-center gap-4 mb-8">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium">Credits</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium">Level</span>
                  <span className="font-bold">Intermediate</span>
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium">Code</span>
                  <span className="font-bold">SBW-9237</span>
                </div>
              </div>
              
              {/* Certification Text */}
              <div className="space-y-6 mb-8">
                <p className="text-xl text-muted-foreground italic">This is to certify that</p>
                
                <div className="py-4">
                  <h4 className="text-4xl font-bold text-foreground mb-2">
                    {formData.learnerName || 'Learner Name'}
                  </h4>
                  <div className="w-80 h-0.5 bg-primary mx-auto"></div>
                </div>
                
                <p className="text-xl text-muted-foreground italic">has successfully completed the course</p>
                
                <div className="py-2">
                  <h5 className="text-3xl font-semibold text-primary leading-relaxed">
                    {formData.courseTitle || 'Course Title'}
                  </h5>
                </div>
                
                {formData.score && (
                  <p className="text-lg text-muted-foreground">
                    with an overall score of <span className="font-bold text-primary text-xl">{formData.score}%</span>
                  </p>
                )}
              </div>
              
              {/* Signature and Verification Section */}
              <div className="grid grid-cols-3 gap-8 items-end mb-8">
                {/* Date */}
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Date of Completion</p>
                    <div className="border-b-2 border-primary/30 pb-1">
                      <p className="text-lg font-semibold text-foreground">
                        {formData.completionDate ? format(formData.completionDate, 'MMMM dd, yyyy') : format(new Date(), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-primary/30 bg-white mx-auto mb-2 flex items-center justify-center shadow-md">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="Verification QR Code" className="w-16 h-16" />
                    ) : (
                      <QrCode className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Scan to Verify</p>
                </div>
                
                {/* Instructor Signature */}
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Authorized Signature</p>
                    <div className="border-b-2 border-primary/30 pb-1">
                      <p className="text-2xl font-signature text-primary">
                        {formData.instructor || 'Jeffrey D Thorn'}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Chief Instructor</p>
                  </div>
                </div>
              </div>
              
              {/* Expiration Date */}
              {formData.expirationDate && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Valid until: {format(formData.expirationDate, 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}
              
              {/* Certificate ID - positioned above black line, below purple border */}
              <div className="mt-6 mb-4">
                <p className="text-sm text-muted-foreground text-center font-medium">
                  Certificate ID: {formData.certificateNumber}
                </p>
              </div>
              
              {/* Black line separator */}
              <div className="border-t-2 border-black mx-8"></div>
              
              {/* Disclaimer */}
              <div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed text-center max-w-4xl mx-auto">
                  <span className="font-semibold">Disclaimer:</span> This certificate confirms course completion only. EaseLearn and Jeffrey D Thorn make no warranties regarding legal compliance. Employers are solely responsible for meeting all applicable training and documentation requirements.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};