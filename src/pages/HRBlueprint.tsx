import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AIChatModal } from "@/components/AIChatModal";
import easeworksLogo from "@/assets/easeworks-logo.png";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

const HRBlueprint = () => {
  const { user, loading: authLoading, isAdmin, isSuperAdmin } = useAuth();
  const [contactName, setContactName] = useState("Dr. Wade Logan");
  const [companyName, setCompanyName] = useState("Logan Family Dentistry");
  const [loading, setLoading] = useState(true);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [editableContent, setEditableContent] = useState<Record<string, string>>({});
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [chatModals, setChatModals] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Access control - only internal staff and super admins can access this page
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isSuperAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchCompanyContact();
  }, []);

  const fetchCompanyContact = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's company role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('role', 'company_admin')
        .single();

      if (userRoles?.company_id) {
        // Get company information
        const { data: company } = await supabase
          .from('company_settings')
          .select('company_name')
          .eq('id', userRoles.company_id)
          .single();

        if (company) {
          setCompanyName(company.company_name);
        }

        // Try to get a contact person from employees table
        const { data: contact } = await supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('company_id', userRoles.company_id)
          .limit(1)
          .single();

        if (contact) {
          setContactName(`${contact.first_name} ${contact.last_name}`);
        }
      }
    } catch (error) {
      console.error('Error fetching company contact:', error);
      // Keep default values if there's an error
    } finally {
      setLoading(false);
    }
  };

  const openChatModal = (section: string) => {
    setChatModals(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const closeChatModal = (section: string) => {
    setChatModals(prev => ({
      ...prev,
      [section]: false
    }));
  };

  const handleChatContentSave = (section: string, content: string) => {
    setEditableContent(prev => ({
      ...prev,
      [section]: content
    }));
    closeChatModal(section);
  };

  const handleEditContent = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveContent = (section: string) => {
    setEditingSection(null);
    toast({
      title: "Content Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleContentChange = (section: string, value: string) => {
    setEditableContent(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const renderContentEditor = (section: string) => {
    const isEditing = editingSection === section;
    const hasContent = editableContent[section];
    
    if (!hasContent && !isEditing) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-900">Content for Presentation</h4>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditContent(section)}
                className="text-xs"
              >
                Edit Content
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSaveContent(section)}
                className="text-xs"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <textarea
            className="w-full h-32 p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editableContent[section] || ''}
            onChange={(e) => handleContentChange(section, e.target.value)}
            placeholder="Enter your content here..."
          />
        ) : (
          <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border">
            {editableContent[section]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbNav items={[{ label: "HR Blueprint" }]} />
      
      {/* Hero Section with Mountain Background */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://info.easeworks.com/hubfs/raw_assets/public/Matter/images/service-listing1-banner.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/70 via-slate-700/70 to-slate-600/70" />
        
        <div className="relative max-w-5xl mx-auto text-center px-6 py-20 text-white">
          <h2 className="text-xl md:text-2xl mb-6 font-light">
            {loading ? "Loading..." : `Greetings ${contactName}!`}
          </h2>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight">
            HR blueprint™
          </h1>
          <p className="text-xl md:text-2xl max-w-5xl mx-auto leading-relaxed font-light">
            <em>A tailored roadmap for simplifying payroll, reducing administrative burden, 
            and ensuring HR compliance — built specifically for your organization using 
            Easeworks' proprietary HR Blueprint process.</em> This personalized HR blueprint 
            outlines the challenges we identified, the risks of inaction, and a scalable 
            solution designed around your goals. Use this proposal as a guide to understand 
            where you are, where you're exposed, and how Easeworks can help you move 
            forward — with confidence and clarity.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <iframe 
              src="https://app.colossyan.com/embed/5e1ac5b2-a528-44ce-8c2c-45a8f98d2e8d?t=1" 
              width="560" 
              height="315" 
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
              className="w-full h-auto aspect-video rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* SPIN Methodology Cards */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Assessment Requirement Notice */}
          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <strong>Internal Staff Notice:</strong> AI content generation requires a completed HR risk assessment. 
                  Direct your client to complete their assessment first for accurate, personalized analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 items-stretch">
            {/* Executive Summary */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow text-center h-full">
              <div className="flex flex-col items-center h-full">
                <img 
                  src="https://info.easeworks.com/hubfs/Topical.png" 
                  alt="Executive Summary" 
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Executive Summary</h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  We've evaluated your current HR and payroll processes to understand your structure, resources, and goals. This provides the foundation to build a solution aligned with your operational needs challenges and opportunities.
                </p>
                <Button 
                  variant="outline" 
                  className="font-semibold mt-auto"
                  onClick={() => openChatModal('current-state')}
                >
                  Chat with AI Assistant
                </Button>
                {renderContentEditor('current-state')}
              </div>
            </Card>

            {/* Gaps and Risks */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow text-center h-full">
              <div className="flex flex-col items-center h-full">
                <img 
                  src="https://info.easeworks.com/hubfs/cta-footericon.png" 
                  alt="Gaps and Risks" 
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Gaps and Risks Identified</h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  Our assessment uncovered process gaps, compliance concerns, or inefficiencies. These pain points affect productivity, increase risk, and prevent your team from focusing on higher-value tasks and long-term business goals.
                </p>
                <Button 
                  variant="outline" 
                  className="font-semibold mt-auto"
                  onClick={() => openChatModal('gaps-risks')}
                >
                  Chat with AI Assistant
                </Button>
                {renderContentEditor('gaps-risks')}
              </div>
            </Card>

            {/* Impact of Inaction */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow text-center h-full">
              <div className="flex flex-col items-center h-full">
                <img 
                  src="https://info.easeworks.com/hubfs/Nationally.png" 
                  alt="Impact of Inaction" 
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">The Impact of Doing Nothing</h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  Continuing without change can lead to costly errors, audit risk, and employee dissatisfaction. These issues can compound, disrupt operations, and create unnecessary exposure for leadership, finance, and human resources.
                </p>
                <Button 
                  variant="outline" 
                  className="font-semibold mt-auto"
                  onClick={() => openChatModal('impact-inaction')}
                >
                  Chat with AI Assistant
                </Button>
                {renderContentEditor('impact-inaction')}
              </div>
            </Card>

            {/* Path Forward */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow text-center h-full">
              <div className="flex flex-col items-center h-full">
                <img 
                  src="https://info.easeworks.com/hubfs/Topical.png" 
                  alt="Path Forward" 
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">A Smarter Path Forward</h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  We've designed a customized solution based on your needs — delivering the tools, support, and structure to improve compliance, streamline operations, and free your team to focus on strategic growth.
                </p>
                <Button 
                  variant="outline" 
                  className="font-semibold mt-auto"
                  onClick={() => openChatModal('path-forward')}
                >
                  Chat with AI Assistant
                </Button>
                {renderContentEditor('path-forward')}
              </div>
            </Card>

            {/* Custom Solution */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow text-center h-full">
              <div className="flex flex-col items-center h-full">
                <img 
                  src="https://info.easeworks.com/hubfs/hr-pro.png" 
                  alt="Custom Solution" 
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Your Custom-Built Solution</h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  This tailored HR Blueprint outlines your roadmap to success — combining modern technology, proactive HR support, and process automation to reduce administrative strain.
                </p>
                <Button 
                  variant="outline" 
                  className="font-semibold mt-auto"
                  onClick={() => openChatModal('custom-solution')}
                >
                  Chat with AI Assistant
                </Button>
                {renderContentEditor('custom-solution')}
              </div>
            </Card>

            {/* Investment Analysis */}
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow text-center h-full">
              <div className="flex flex-col items-center h-full">
                <img 
                  src="https://info.easeworks.com/hubfs/raw_assets/public/Matter/images/icon-images/shield.svg" 
                  alt="Investment Analysis" 
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Your Investment Analysis</h3>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  Below is your customized investment. At 13.71% labor cost, Easeworks handles payroll, HR, and compliance—compared to 13.31% if done internally without expert support or infrastructure.
                </p>
                <Button 
                  variant="outline" 
                  className="font-semibold mt-auto"
                  onClick={() => openChatModal('investment-analysis')}
                >
                  Chat with AI Assistant
                </Button>
                {renderContentEditor('investment-analysis')}
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* AI Chat Modals - One for each section */}
      {['current-state', 'gaps-risks', 'impact-inaction', 'path-forward', 'custom-solution', 'investment-analysis'].map(section => (
        <AIChatModal
          key={section}
          isOpen={chatModals[section] || false}
          onClose={() => closeChatModal(section)}
          section={section}
          companyName={companyName}
          contactName={contactName}
          onSaveContent={(content) => handleChatContentSave(section, content)}
        />
      ))}

      {/* Detailed Content Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Annualized Cost Comparison</h2>
          <h3 className="text-2xl font-semibold text-center mb-12 text-gray-700">{companyName}</h3>
          <p className="text-lg text-center mb-12 text-gray-600">This is a side-by-side cost comparison for {contactName}</p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <img 
              src="https://info.easeworks.com/hubfs/Screenshot%202025-03-27%20at%203.59.09%20AM.png"
              alt="Cost Comparison Chart"
              className="w-full h-auto"
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">One-Time & Optional Fees</h3>
            <img 
              src="https://info.easeworks.com/hubfs/Screenshot%202025-03-27%20at%203.44.43%20AM.png"
              alt="One-Time Fees Chart"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Service Accordions */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="how-we-work" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">How we Work with Businesses</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/How%20we%20help%20you%20succeed.png?width=2300&height=1282&name=How%20we%20help%20you%20succeed.png"
                  alt="How we help you succeed"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="benefits" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">Benefits Procurement & Administration</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/Benefits.png?width=2294&height=1278&name=Benefits.png"
                  alt="Benefits"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hr-outsourcing" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">HR Outsourcing Advantage</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/CO-Employment.png?width=2306&height=1288&name=CO-Employment.png"
                  alt="Co-Employment"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="workers-comp" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">Worker's Comp and Claims Management</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/Safety%20%26%20Risk%20Management.png?width=2294&height=1258&name=Safety%20%26%20Risk%20Management.png"
                  alt="Safety & Risk Management"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="compliance" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">Simple Regulatory Compliance</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/Regulatory.png?width=2290&height=1278&name=Regulatory.png"
                  alt="Regulatory"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="software" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">Award Winning Software</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/HCM%20Software.png?width=2290&height=1278&name=HCM%20Software.png"
                  alt="HCM Software"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="core-values" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">Our Core Values</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/Core%20Values.png?width=2296&height=1278&name=Core%20Values.png"
                  alt="Core Values"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="paga" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <h4 className="text-2xl font-bold text-gray-900">PAGA - License to Steal</h4>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <img 
                  src="https://info.easeworks.com/hs-fs/hubfs/PAGA.png?width=2302&height=1288&name=PAGA.png"
                  alt="PAGA"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Call to Action */}
      <section 
        className="py-20 px-6 text-white text-center relative"
        style={{
          backgroundImage: `url('https://info.easeworks.com/hubfs/raw_assets/public/Matter/images/bottom-pane-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Move Forward?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            We're excited to support your team. Click below to accept this proposal and take the first step. Once submitted, we'll follow up with a DocuSign agreement and onboarding details.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
          >
            Next Step Prepare Agreement
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <img 
                src="https://info.easeworks.com/hs-fs/hubfs/raw_assets/public/Easeworks_October2023/images/easeworks-logo-darkbg.png?width=240&name=easeworks-logo-darkbg.png" 
                alt="EaseWorks Logo" 
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400 leading-relaxed mb-6">
                Subscribe for our the latest news and legal updates that will affect your business.
              </p>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Newsletter Sign Up</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name*" className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700" />
                  <input type="text" placeholder="Last Name*" className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700" />
                </div>
                <input type="text" placeholder="Company Name*" className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700" />
                <input type="email" placeholder="Email*" className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700" />
                <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Helpful Links</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="https://easeworks.com/about/" className="hover:text-white">About Easeworks</a></div>
                <div><a href="https://easeworks.com/solutions/" className="hover:text-white">Our Solutions</a></div>
                <div><a href="https://easeworks.com/resources/" className="hover:text-white">Resources</a></div>
                <div><a href="https://easeworks.com/consultation/" className="hover:text-white">Get a Consultation</a></div>
                <div><a href="https://easeworks.com/hr-assessment/" className="hover:text-white">Free HR Assessment</a></div>
                <div><a href="https://easeworks.com/blog/" className="hover:text-white">The EaseBlog</a></div>
                <div><a href="https://easeworks.com/client-login/" className="hover:text-white">Client Login</a></div>
                <div><a href="https://easeworks.com/support/" className="hover:text-white">Employee Support</a></div>
                <div><a href="https://easeworks.com/careers/" className="hover:text-white">Careers</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-gray-400">
                <div>5016 California Ave</div>
                <div>Bakersfield, CA 93309</div>
                <div className="pt-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  (888) 843-0880
                </div>
                <div>
                  <Mail className="inline w-4 h-4 mr-2" />
                  Hello@Easeworks.com
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>©2000 Easeworks, Inc. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HRBlueprint;
